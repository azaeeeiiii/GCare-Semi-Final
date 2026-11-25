import { api } from './api';

export async function submitContactMessage({ category, message, name = '', email = '' }) {
  try {
    await api('/contact', {
      method: 'POST',
      body: JSON.stringify({ category, message, name, email }),
    });
    return { ok: true };
  } catch (err) {
    console.error('Contact submission failed:', err.message);
    if (/email/i.test(err.message)) {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: 'Your suggestion could not be submitted. Please try again.' };
  }
}

export async function listContactMessages() {
  try {
    const { rows } = await api('/admin/contact');
    return { rows };
  } catch (err) {
    return { rows: [], error: err.message };
  }
}

export async function setContactRead(id, isRead) {
  try {
    await api(`/admin/contact/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: isRead }),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}