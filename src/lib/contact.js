import { supabase } from './supabase';

export async function submitContactMessage({ category, message, user }) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id || null;

  const { error } = await supabase
    .from('contact_messages')
    .insert({
      category,
      message,
      author_name: user?.name || '',
      author_email: user?.email || '',
      user_id: userId,
    });

  if (error) {
    const missingTable =
      /Could not find the table|schema cache/i.test(error.message || '');
    console.error('Contact submission failed:', error.message);

    return {
      ok: false,
      error: missingTable
        ? 'The contact service is temporarily unavailable. Please try again later.'
        : 'Your suggestion could not be submitted. Please try again.',
    };
  }

  return { ok: true };
}
