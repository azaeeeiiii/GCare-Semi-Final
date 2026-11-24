import { api } from './api';
import { fileToDataUrl } from './http';

export const ID_BUCKET = 'id-verifications';

export async function getMyVerification() {
  try {
    const { row } = await api('/verification/me');
    return { row };
  } catch (err) {
    return { row: null, error: err.message };
  }
}

export async function submitVerification(idFile, selfieFile) {
  try {
    const id = await fileToDataUrl(idFile);
    const selfie = selfieFile ? await fileToDataUrl(selfieFile) : '';
    const { row } = await api('/verification', {
      method: 'POST',
      body: JSON.stringify({ id, selfie }),
    });
    return { ok: true, row };
  } catch (err) {
    return { ok: false, error: err.message || 'Upload failed. Please try again.' };
  }
}

export async function listVerifications() {
  try {
    const { rows } = await api('/admin/verifications');
    return { rows };
  } catch (err) {
    return { rows: [], error: err.message };
  }
}

export async function signedUrl(path) {
  if (!path) return '';
  try {
    const { url } = await api(`/admin/verifications/image?path=${encodeURIComponent(path)}`);
    return url || '';
  } catch {
    return '';
  }
}

export async function reviewVerification(userId, status, reason = '') {
  try {
    await api(`/admin/verifications/${userId}/review`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function listVerifiedIds() {
  try {
    const { ids } = await api('/verified');
    return new Set(ids);
  } catch {
    return new Set();
  }
}