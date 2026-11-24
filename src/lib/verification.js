import { supabase } from './supabase';

export const ID_BUCKET = 'id-verifications';

async function currentUid() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
}

export async function getMyVerification() {
  const uid = await currentUid();
  if (!uid) return { row: null };
  const { data, error } = await supabase
    .from('id_verifications')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();
  if (error) return { row: null, error: error.message };
  return { row: data };
}

async function uploadPrivate(uid, file, tag) {
  const ext = (file.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
  const path = `${uid}/${Date.now()}-${tag}.${ext}`;
  const { error } = await supabase.storage
    .from(ID_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return path;
}

export async function submitVerification(idFile, selfieFile) {
  try {
    const uid = await currentUid();
    if (!uid) return { ok: false, error: 'You are not signed in.' };

    const id_path = await uploadPrivate(uid, idFile, 'id');
    const selfie_path = selfieFile ? await uploadPrivate(uid, selfieFile, 'selfie') : null;

    const { data, error } = await supabase
      .from('id_verifications')
      .upsert(
        {
          user_id: uid,
          id_path,
          selfie_path,
          status: 'pending',
          reject_reason: null,
          submitted_at: new Date().toISOString(),
          reviewed_at: null,
          reviewed_by: null,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, row: data };
  } catch (err) {
    return { ok: false, error: err.message || 'Upload failed. Please try again.' };
  }
}

export async function listVerifications() {
  const { data, error } = await supabase
    .from('id_verifications')
    .select('*')
    .order('submitted_at', { ascending: false });
  if (error) return { rows: [], error: error.message };

  const ids = data.map((r) => r.user_id);
  let names = {};
  if (ids.length) {
    const { data: profs } = await supabase.from('profiles').select('id, name').in('id', ids);
    names = Object.fromEntries((profs || []).map((p) => [p.id, p.name]));
  }
  return { rows: data.map((r) => ({ ...r, name: names[r.user_id] || 'Unknown' })) };
}

export async function signedUrl(path) {
  if (!path) return '';
  const { data, error } = await supabase.storage.from(ID_BUCKET).createSignedUrl(path, 300);
  if (error) return '';
  return data.signedUrl;
}

export async function reviewVerification(userId, status, reason = '') {
  const reviewer = await currentUid();
  const { data, error } = await supabase
    .from('id_verifications')
    .update({
      status,
      reject_reason: status === 'rejected' ? reason.trim() || 'No reason given.' : null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewer,
    })
    .eq('user_id', userId)
    .select('user_id');
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: false, error: 'Could not update this request.' };
  return { ok: true };
}

export async function listVerifiedIds() {
  const { data, error } = await supabase.from('verified_users').select('user_id');
  if (error) return new Set();
  return new Set((data || []).map((r) => r.user_id));
}