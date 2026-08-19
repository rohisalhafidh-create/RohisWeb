import 'dotenv/config';
import express from "express";
import cors from "cors";
import { requireAuth, AuthRequest } from "../src/middleware/auth.ts";
import { firestore } from "../src/lib/firebase-admin.ts";
import { Timestamp } from 'firebase-admin/firestore';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Firestore collection references
const activitiesRef = firestore.collection('activities');
const activityImagesRef = firestore.collection('activity_images');
const achievementsRef = firestore.collection('achievements');
const membersRef = firestore.collection('organization_members');
const settingsRef = firestore.collection('site_settings');

// Helper: convert Firestore document to plain JS object
function docToObj(doc: FirebaseFirestore.DocumentSnapshot): any | null {
  if (!doc.exists) return null;
  const data = doc.data()!;
  const result: any = { id: doc.id };
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString();
    } else {
      result[key] = value;
    }
  }
  return result;
}

function snapshotToArray(snapshot: FirebaseFirestore.QuerySnapshot): any[] {
  return snapshot.docs.map(doc => docToObj(doc)).filter(Boolean);
}

export async function seedDatabase() {
  const snapshot = await activitiesRef.limit(1).get();
  if (!snapshot.empty) return;

  console.log("Seeding initial data...");
  const batch = firestore.batch();
  const now = Timestamp.now();

  // Seed Settings
  batch.set(settingsRef.doc('default'), {
    siteName: "Rohis Al Hafidh",
    schoolName: "SMKN 1 Semarang",
    tagline: "Menumbuhkan Generasi Islami, Berilmu, Berakhlak, dan Berprestasi.",
    description: "Rohis Al Hafidh merupakan organisasi kerohanian Islam di SMKN 1 Semarang yang menjadi wadah bagi siswa untuk memperdalam ilmu agama, membangun akhlak, mempererat ukhuwah Islamiyah, serta berkontribusi dalam berbagai kegiatan positif di lingkungan sekolah.",
  }, { merge: true });

  // Seed Activities
  batch.set(activitiesRef.doc('act_1'), {
    title: "Pesantren Kilat Ramadhan",
    slug: "pesantren-kilat-ramadhan",
    description: "Kegiatan rutin bulan suci Ramadhan untuk meningkatkan ketaqwaan siswa siswi SMKN 1 Semarang.",
    category: "Ramadhan",
    date: now,
    createdAt: now,
    updatedAt: now,
  });
  batch.set(activitiesRef.doc('act_2'), {
    title: "Kajian Jumat Rutin",
    slug: "kajian-jumat-rutin",
    description: "Kajian rutin setiap hari Jumat di masjid sekolah untuk memperdalam ilmu agama.",
    category: "Kajian",
    date: now,
    createdAt: now,
    updatedAt: now,
  });

  // Seed Achievements
  batch.set(achievementsRef.doc('ach_1'), {
    title: "Juara 1 MTQ Pelajar",
    event: "Lomba MAPSI Tingkat Kota",
    description: "Meraih juara pertama dalam cabang Musabaqah Tilawatil Quran tingkat pelajar SMA/SMK se-Kota Semarang.",
    level: "Kota",
    year: new Date().getFullYear(),
    winner: "Ahmad Fulan",
    createdAt: now,
    updatedAt: now,
  });

  // Seed Members
  batch.set(membersRef.doc('mem_1'), {
    name: "Bapak Guru S.PdI",
    position: "Pembina Rohis",
    category: "Pembina Putra",
    gender: "Laki-laki",
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  });
  batch.set(membersRef.doc('mem_2'), {
    name: "Ibu Guru S.PdI",
    position: "Pembina Rohis",
    category: "Pembina Putri",
    gender: "Perempuan",
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  });
  batch.set(membersRef.doc('mem_3'), {
    name: "Fulan bin Fulan",
    position: "Ketua Umum",
    category: "Pengurus Inti",
    gender: "Laki-laki",
    sortOrder: 3,
    createdAt: now,
    updatedAt: now,
  });

  await batch.commit();
  console.log("Seeding complete.");
}

// ---- PUBLIC API ROUTES ----
app.get("/api/activities", async (req, res) => {
  try {
    const snapshot = await activitiesRef.orderBy('date', 'desc').get();
    res.json(snapshotToArray(snapshot));
  } catch (e: any) {
    res.status(500).json({ error: "Failed to fetch activities", details: e.message });
  }
});

app.get("/api/activities/:id", async (req, res) => {
  try {
    const doc = await activitiesRef.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Not found" });
    const imagesSnapshot = await activityImagesRef.where('activityId', '==', req.params.id).get();
    res.json({ ...docToObj(doc), images: snapshotToArray(imagesSnapshot) });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to fetch activity", details: e.message });
  }
});

app.get("/api/achievements", async (req, res) => {
  try {
    const snapshot = await achievementsRef.orderBy('year', 'desc').get();
    res.json(snapshotToArray(snapshot));
  } catch (e: any) {
    res.status(500).json({ error: "Failed to fetch achievements", details: e.message });
  }
});

app.get("/api/organization", async (req, res) => {
  try {
    const snapshot = await membersRef.orderBy('sortOrder').get();
    res.json(snapshotToArray(snapshot));
  } catch (e: any) {
    res.status(500).json({ error: "Failed to fetch organization", details: e.message });
  }
});

app.get("/api/settings", async (req, res) => {
  try {
    const doc = await settingsRef.doc('default').get();
    res.json(docToObj(doc) || null);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to fetch settings", details: e.message });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const [acts, achs, mems] = await Promise.all([
      activitiesRef.get(),
      achievementsRef.get(),
      membersRef.get(),
    ]);
    res.json({
      totalActivities: acts.size,
      totalAchievements: achs.size,
      totalMembers: mems.size,
    });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to fetch stats", details: e.message });
  }
});

// ---- PROTECTED API ROUTES ----

// Activities CRUD
app.post("/api/activities", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id, title, slug, description, category, date, coverImage } = req.body;
    const now = Timestamp.now();
    await activitiesRef.doc(id).set({
      title, slug, description, category,
      date: Timestamp.fromDate(new Date(date)),
      coverImage: coverImage || null,
      createdAt: now,
      updatedAt: now,
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to create activity", details: e.message });
  }
});

app.put("/api/activities/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, description, category, date, coverImage } = req.body;
    await activitiesRef.doc(req.params.id).update({
      title, description, category,
      date: Timestamp.fromDate(new Date(date)),
      coverImage: coverImage || null,
      updatedAt: Timestamp.now(),
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to update activity", details: e.message });
  }
});

app.delete("/api/activities/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    // Cascade delete: remove related images first
    const imagesSnapshot = await activityImagesRef.where('activityId', '==', req.params.id).get();
    const batch = firestore.batch();
    imagesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    batch.delete(activitiesRef.doc(req.params.id));
    await batch.commit();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to delete activity", details: e.message });
  }
});

// Activity Images
app.post("/api/activities/:id/images", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id: imageId, imageUrl } = req.body;
    await activityImagesRef.doc(imageId).set({
      activityId: req.params.id,
      imageUrl,
      createdAt: Timestamp.now(),
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to add image", details: e.message });
  }
});

app.delete("/api/images/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await activityImagesRef.doc(req.params.id).delete();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to delete image", details: e.message });
  }
});

// Achievements CRUD
app.post("/api/achievements", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id, title, event, description, level, year, winner, imageUrl } = req.body;
    const now = Timestamp.now();
    await achievementsRef.doc(id).set({
      title, event, description, level,
      year: parseInt(year),
      winner,
      imageUrl: imageUrl || null,
      createdAt: now,
      updatedAt: now,
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to create achievement", details: e.message });
  }
});

app.put("/api/achievements/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, event, description, level, year, winner, imageUrl } = req.body;
    await achievementsRef.doc(req.params.id).update({
      title, event, description, level,
      year: parseInt(year),
      winner,
      imageUrl: imageUrl || null,
      updatedAt: Timestamp.now(),
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to update achievement", details: e.message });
  }
});

app.delete("/api/achievements/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await achievementsRef.doc(req.params.id).delete();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to delete achievement", details: e.message });
  }
});

// Organization Members CRUD
app.post("/api/organization", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id, name, position, category, gender, photoUrl, description, sortOrder } = req.body;
    const now = Timestamp.now();
    await membersRef.doc(id).set({
      name, position, category, gender,
      photoUrl: photoUrl || null,
      description: description || null,
      sortOrder: parseInt(sortOrder) || 0,
      createdAt: now,
      updatedAt: now,
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to create member", details: e.message });
  }
});

app.put("/api/organization/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, position, category, gender, photoUrl, description, sortOrder } = req.body;
    await membersRef.doc(req.params.id).update({
      name, position, category, gender,
      photoUrl: photoUrl || null,
      description: description || null,
      sortOrder: parseInt(sortOrder) || 0,
      updatedAt: Timestamp.now(),
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to update member", details: e.message });
  }
});

app.delete("/api/organization/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    await membersRef.doc(req.params.id).delete();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to delete member", details: e.message });
  }
});

export default app;
