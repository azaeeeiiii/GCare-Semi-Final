import { useEffect, useState } from 'react';
import { supabase } from './supabase';

/* News data layer (Supabase table `news` + storage bucket `news-images`).
   - Everyone can read published news. Only admins can post, edit or delete.
   - If the `news` table does not exist yet (SQL not run), the sample stories below are shown instead. */

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

/* Public News page: published stories, newest first */
export function useNews() {
  const [news, setNews] = useState(MOCK_NEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    supabase
      .from('news')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!alive) return;
        if (!error && data) setNews(data.map(fromRow)); // table exists: show real data (even if empty)
        setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  return { news, loading };
}

/* Admin: every story, including drafts */
export async function fetchAllNews() {
  const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
  return { rows: (data || []).map(fromRow), error };
}

/* Shrink a photo (max 1600px, JPEG) so uploads are small and fast */
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

/* Upload an image to Supabase Storage and return its public URL */
export async function uploadNewsImage(file) {
  const blob = await shrink(file);
  const path = `${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(NEWS_BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
  if (error) throw new Error(error.message);
  return supabase.storage.from(NEWS_BUCKET).getPublicUrl(path).data.publicUrl;
}

/* Remove an uploaded image (best effort) */
export async function deleteNewsImage(url) {
  const marker = `/${NEWS_BUCKET}/`;
  const i = url ? url.indexOf(marker) : -1;
  if (i === -1) return;
  await supabase.storage.from(NEWS_BUCKET).remove([url.slice(i + marker.length)]);
}

export const formatNewsDate = (iso) =>
  new Date(iso).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });