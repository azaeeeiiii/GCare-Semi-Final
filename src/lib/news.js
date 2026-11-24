import { useEffect, useState } from 'react';
import { api, fileToDataUrl } from './http';

export const NEWS_CATEGORIES = {
  update: { label: 'Update', color: '#1b2437' },
  community: { label: 'Community', color: '#067647' },
  safety: { label: 'Safety', color: '#a00000' },
  event: { label: 'Event', color: '#2f6f9f' },
  announcement: { label: 'Announcement', color: '#c2570c' },
};

export const NEWS_BUCKET = 'news-images';

/* Sample stories (mock data) */
export const MOCK_NEWS = [
  {
    id: 'm1',
    category: 'announcement',
    title: 'GCare Is Now Live for Golden Country Homes',
    summary: 'Residents can now report incidents, follow alerts and sign up as volunteers in one place.',
    body: [
      'We are happy to announce that GCare is now open to all Golden Country Homes residents. You can report incidents, read community alerts, and join volunteer activities straight from your phone.',
      'Create an account, complete your profile, and turn on notifications so you never miss an important update from your barangay.',
    ],
    image: '',
    author: 'GCare Team',
    createdAt: '2026-11-18T09:00:00',
  },
  {
    id: 'm2',
    category: 'safety',
    title: 'Typhoon Preparedness Tips for Your Household',
    summary: 'Prepare a go-bag, know your evacuation route, and keep emergency numbers within reach.',
    body: [
      'With the rainy season ongoing, every household should have a go-bag with water, food, flashlight, power bank, medicines and copies of important documents.',
      'Identify the nearest evacuation center, agree on a meeting place with your family, and save the barangay hotline on your phone.',
    ],
    image: '',
    author: 'GCare Team',
    createdAt: '2026-11-15T14:30:00',
  },
  {
    id: 'm3',
    category: 'event',
    title: 'Community Clean-Up Drive This Saturday',
    summary: 'Join your neighbors in cleaning canals and streets to help prevent flooding.',
    body: [
      'Clogged drainage is one of the main causes of street flooding. This Saturday, volunteers will gather at the barangay hall at 7:00 AM to clean nearby canals and streets.',
      'Gloves and trash bags will be provided. Sign up on the Volunteer page to reserve your slot.',
    ],
    image: '',
    author: 'Barangay Volunteers',
    createdAt: '2026-11-12T08:00:00',
  },
  {
    id: 'm4',
    category: 'community',
    title: 'Relief Packing Volunteers Thank You',
    summary: 'More than 60 residents helped pack relief goods for affected families last weekend.',
    body: [
      'Thank you to everyone who helped pack relief goods last weekend. Your time and effort will reach more than 200 families in nearby areas.',
      'Watch the Volunteer page for the next activity.',
    ],
    image: '',
    author: 'GCare Team',
    createdAt: '2026-11-09T17:45:00',
  },
];

const fromRow = (n) => ({
  id: n.id,
  category: n.category,
  title: n.title,
  summary: n.summary,
  body: String(n.body || '').split('\n').map((s) => s.trim()).filter(Boolean),
  image: n.image_url || '',
  author: n.author || 'GCare Team',
  createdAt: n.created_at,
  published: n.published,
});

export function useNews() {
  const [news, setNews] = useState(MOCK_NEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api('/api/news')
      .then(({ rows }) => {
        if (alive) setNews(rows.map(fromRow)); // server reachable: show real data (even if empty)
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  return { news, loading };
}

/* Admin */
export async function fetchAllNews() {
  try {
    const { rows } = await api('/api/admin/news');
    return { rows: rows.map(fromRow), error: null };
  } catch (err) {
    return { rows: [], error: err };
  }
}

export async function saveNews(id, payload) {
  try {
    await api(id ? `/api/admin/news/${id}` : '/api/admin/news', {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(payload),
    });
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

export async function setNewsPublished(id, published) {
  return saveNews(id, { published });
}

export async function removeNews(id) {
  try {
    await api(`/api/admin/news/${id}`, { method: 'DELETE' });
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

async function shrink(file) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file (JPG or PNG).');
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close?.();
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Could not read that image.'))), 'image/jpeg', 0.82));
}

export async function uploadNewsImage(file) {
  const blob = await shrink(file);
  const image = await fileToDataUrl(blob);
  const { url } = await api('/api/admin/news/image', { method: 'POST', body: JSON.stringify({ image }) });
  return url;
}

export async function deleteNewsImage(url) {
  if (!url) return;
  try {
    await api('/api/admin/news/image', { method: 'DELETE', body: JSON.stringify({ url }) });
  } catch {
    
  }
}

export const formatNewsDate = (iso) =>
  new Date(iso).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });