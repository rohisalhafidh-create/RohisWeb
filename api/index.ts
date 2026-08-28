import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, AuthRequest } from '../src/middleware/auth';

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

function database() {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.');
  return supabase;
}

function message(error: unknown) { return error instanceof Error ? error.message : String(error); }

export async function seedDatabase() {
  const client = database();
  const { data, error } = await client.from('site_settings').select('id').eq('id', 'default').maybeSingle();
  if (error) throw error;
  if (!data) {
    const { error: insertError } = await client.from('site_settings').insert({ id: 'default', site_name: 'RohisWeb', description: 'Website Rohani Islam sekolah' });
    if (insertError) throw insertError;
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    databaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
});

app.get('/api/activities', async (_req, res) => {
  try {
    const { data, error } = await database().from('activities').select('*').order('date', { ascending: false });
    if (error) throw error;
    res.json((data || []).map(row => ({ ...row, coverImage: row.cover_image })));
  } catch (error) { res.status(500).json({ error: 'Failed to fetch activities', details: message(error) }); }
});

app.get('/api/activities/:id', async (req, res) => {
  try {
    const client = database();
    const [{ data, error }, { data: images, error: imagesError }] = await Promise.all([
      client.from('activities').select('*').eq('id', req.params.id).maybeSingle(),
      client.from('activity_images').select('*').eq('activity_id', req.params.id),
    ]);
    if (error) throw error;
    if (imagesError) throw imagesError;
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json({ ...data, coverImage: data.cover_image, images: (images || []).map(row => ({ ...row, imageUrl: row.image_url })) });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch activity', details: message(error) }); }
});

app.get('/api/achievements', async (_req, res) => {
  try {
    const { data, error } = await database().from('achievements').select('*').order('year', { ascending: false });
    if (error) throw error;
    res.json((data || []).map(row => ({ ...row, imageUrl: row.image_url })));
  } catch (error) { res.status(500).json({ error: 'Failed to fetch achievements', details: message(error) }); }
});

app.get('/api/organization', async (_req, res) => {
  try {
    const { data, error } = await database().from('organization_members').select('*').order('sort_order');
    if (error) throw error;
    res.json((data || []).map(row => ({ ...row, photoUrl: row.photo_url, sortOrder: row.sort_order })));
  } catch (error) { res.status(500).json({ error: 'Failed to fetch organization', details: message(error) }); }
});

app.get('/api/settings', async (_req, res) => {
  try {
    const { data, error } = await database().from('site_settings').select('*').eq('id', 'default').maybeSingle();
    if (error) throw error;
    res.json(data ? { ...data, siteName: data.site_name } : null);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch settings', details: message(error) }); }
});

app.get('/api/stats', async (_req, res) => {
  try {
    const client = database();
    const results = await Promise.all([
      client.from('activities').select('id', { count: 'exact', head: true }),
      client.from('achievements').select('id', { count: 'exact', head: true }),
      client.from('organization_members').select('id', { count: 'exact', head: true }),
    ]);
    const failed = results.find(result => result.error);
    if (failed?.error) throw failed.error;
    res.json({ totalActivities: results[0].count || 0, totalAchievements: results[1].count || 0, totalMembers: results[2].count || 0 });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch stats', details: message(error) }); }
});

app.post('/api/activities', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id, title, slug, description, category, date, coverImage } = req.body;
    const { error } = await database().from('activities').insert({ id, title, slug, description, category, date, cover_image: coverImage || null });
    if (error) throw error;
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to create activity', details: message(error) }); }
});

app.put('/api/activities/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, description, category, date, coverImage } = req.body;
    const { error } = await database().from('activities').update({ title, description, category, date, cover_image: coverImage || null }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to update activity', details: message(error) }); }
});

app.delete('/api/activities/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { error } = await database().from('activities').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete activity', details: message(error) }); }
});

app.post('/api/activities/:id/images', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id, imageUrl } = req.body;
    const { error } = await database().from('activity_images').insert({ id, activity_id: req.params.id, image_url: imageUrl });
    if (error) throw error;
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to add image', details: message(error) }); }
});

app.delete('/api/images/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { error } = await database().from('activity_images').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete image', details: message(error) }); }
});

app.post('/api/achievements', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id, title, event, description, level, year, winner, imageUrl } = req.body;
    const { error } = await database().from('achievements').insert({ id, title, event, description, level, year: Number(year), winner, image_url: imageUrl || null });
    if (error) throw error;
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to create achievement', details: message(error) }); }
});

app.put('/api/achievements/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, event, description, level, year, winner, imageUrl } = req.body;
    const { error } = await database().from('achievements').update({ title, event, description, level, year: Number(year), winner, image_url: imageUrl || null }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to update achievement', details: message(error) }); }
});

app.delete('/api/achievements/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { error } = await database().from('achievements').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete achievement', details: message(error) }); }
});

app.post('/api/organization', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id, name, position, category, gender, photoUrl, description, sortOrder } = req.body;
    const { error } = await database().from('organization_members').insert({ id, name, position, category, gender, photo_url: photoUrl || null, description: description || null, sort_order: Number(sortOrder) || 0 });
    if (error) throw error;
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to create member', details: message(error) }); }
});

app.put('/api/organization/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, position, category, gender, photoUrl, description, sortOrder } = req.body;
    const { error } = await database().from('organization_members').update({ name, position, category, gender, photo_url: photoUrl || null, description: description || null, sort_order: Number(sortOrder) || 0 }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to update member', details: message(error) }); }
});

app.delete('/api/organization/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { error } = await database().from('organization_members').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete member', details: message(error) }); }
});

export default function handler(req: express.Request, res: express.Response) {
  return app(req, res);
}