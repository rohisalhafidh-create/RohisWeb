import 'dotenv/config';
import express from "express";
import cors from "cors";
import { requireAuth, AuthRequest } from "../src/middleware/auth";
import { firestore } from "../src/lib/firebase-admin";
import { Timestamp } from 'firebase-admin/firestore';

let app: any;

export async function seedDatabase(): Promise<void> {
  const settingsRef = firestore.collection('site_settings');
  const settingsDoc = await settingsRef.doc('default').get();
  if (!settingsDoc.exists) {
    const now = Timestamp.now();
    await settingsRef.doc('default').set({
      siteName: 'RohisWeb',
      description: 'Website Rohani Islam sekolah',
      createdAt: now,
      updatedAt: now,
    });
  }
}

try {
  app = express();
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

  // ---- PUBLIC API ROUTES ----
  app.get("/api/activities", async (req: any, res: any) => {
    try {
      const snapshot = await activitiesRef.orderBy('date', 'desc').get();
      res.json(snapshotToArray(snapshot));
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch activities", details: e.message });
    }
  });

  app.get("/api/activities/:id", async (req: any, res: any) => {
    try {
      const doc = await activitiesRef.doc(req.params.id).get();
      if (!doc.exists) return res.status(404).json({ error: "Not found" });
      const imagesSnapshot = await activityImagesRef.where('activityId', '==', req.params.id).get();
      res.json({ ...docToObj(doc), images: snapshotToArray(imagesSnapshot) });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch activity", details: e.message });
    }
  });

  app.get("/api/achievements", async (req: any, res: any) => {
    try {
      const snapshot = await achievementsRef.orderBy('year', 'desc').get();
      res.json(snapshotToArray(snapshot));
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch achievements", details: e.message });
    }
  });

  app.get("/api/organization", async (req: any, res: any) => {
    try {
      const snapshot = await membersRef.orderBy('sortOrder').get();
      res.json(snapshotToArray(snapshot));
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch organization", details: e.message });
    }
  });

  app.get("/api/settings", async (req: any, res: any) => {
    try {
      const doc = await settingsRef.doc('default').get();
      res.json(docToObj(doc) || null);
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch settings", details: e.message });
    }
  });

  app.get("/api/stats", async (req: any, res: any) => {
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
  app.post("/api/activities", requireAuth, async (req: AuthRequest, res: any) => {
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

  app.put("/api/activities/:id", requireAuth, async (req: AuthRequest, res: any) => {
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

  app.delete("/api/activities/:id", requireAuth, async (req: AuthRequest, res: any) => {
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
  app.post("/api/activities/:id/images", requireAuth, async (req: AuthRequest, res: any) => {
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

  app.delete("/api/images/:id", requireAuth, async (req: AuthRequest, res: any) => {
    try {
      await activityImagesRef.doc(req.params.id).delete();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to delete image", details: e.message });
    }
  });

  // Achievements CRUD
  app.post("/api/achievements", requireAuth, async (req: AuthRequest, res: any) => {
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

  app.put("/api/achievements/:id", requireAuth, async (req: AuthRequest, res: any) => {
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

  app.delete("/api/achievements/:id", requireAuth, async (req: AuthRequest, res: any) => {
    try {
      await achievementsRef.doc(req.params.id).delete();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to delete achievement", details: e.message });
    }
  });

  // Organization Members CRUD
  app.post("/api/organization", requireAuth, async (req: AuthRequest, res: any) => {
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

  app.put("/api/organization/:id", requireAuth, async (req: AuthRequest, res: any) => {
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

  app.delete("/api/organization/:id", requireAuth, async (req: AuthRequest, res: any) => {
    try {
      await membersRef.doc(req.params.id).delete();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to delete member", details: e.message });
    }
  });

} catch (globalError: any) {
  app = (req: any, res: any) => {
    res.status(500).json({ error: "API Initialization Failed", details: String(globalError) });
  };
}

export default app;
