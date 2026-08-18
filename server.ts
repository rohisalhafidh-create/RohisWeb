import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { db } from "./src/db/index.ts";
import { activities, activityImages, achievements, organizationMembers, siteSettings } from "./src/db/schema.ts";
import { eq, desc } from "drizzle-orm";

async function seedDatabase() {
  const existingActivities = await db.select().from(activities).limit(1);
  if (existingActivities.length === 0) {
    console.log("Seeding initial data...");
    
    // Seed Settings
    await db.insert(siteSettings).values({
      id: "default",
      siteName: "Rohis Al Hafidh",
      schoolName: "SMKN 1 Semarang",
      tagline: "Menumbuhkan Generasi Islami, Berilmu, Berakhlak, dan Berprestasi.",
      description: "Rohis Al Hafidh merupakan organisasi kerohanian Islam di SMKN 1 Semarang yang menjadi wadah bagi siswa untuk memperdalam ilmu agama, membangun akhlak, mempererat ukhuwah Islamiyah, serta berkontribusi dalam berbagai kegiatan positif di lingkungan sekolah.",
    }).onConflictDoNothing();

    // Seed Activities
    await db.insert(activities).values([
      {
        id: "act_1",
        title: "Pesantren Kilat Ramadhan",
        slug: "pesantren-kilat-ramadhan",
        description: "Kegiatan rutin bulan suci Ramadhan untuk meningkatkan ketaqwaan siswa siswi SMKN 1 Semarang.",
        category: "Ramadhan",
        date: new Date(),
      },
      {
        id: "act_2",
        title: "Kajian Jumat Rutin",
        slug: "kajian-jumat-rutin",
        description: "Kajian rutin setiap hari Jumat di masjid sekolah untuk memperdalam ilmu agama.",
        category: "Kajian",
        date: new Date(),
      }
    ]).onConflictDoNothing();

    // Seed Achievements
    await db.insert(achievements).values([
      {
        id: "ach_1",
        title: "Juara 1 MTQ Pelajar",
        event: "Lomba MAPSI Tingkat Kota",
        description: "Meraih juara pertama dalam cabang Musabaqah Tilawatil Quran tingkat pelajar SMA/SMK se-Kota Semarang.",
        level: "Kota",
        year: new Date().getFullYear(),
        winner: "Ahmad Fulan",
      }
    ]).onConflictDoNothing();

    // Seed Members
    await db.insert(organizationMembers).values([
      {
        id: "mem_1",
        name: "Bapak Guru S.PdI",
        position: "Pembina Rohis",
        category: "Pembina Putra",
        gender: "Laki-laki",
        sortOrder: 1,
      },
      {
        id: "mem_2",
        name: "Ibu Guru S.PdI",
        position: "Pembina Rohis",
        category: "Pembina Putri",
        gender: "Perempuan",
        sortOrder: 2,
      },
      {
        id: "mem_3",
        name: "Fulan bin Fulan",
        position: "Ketua Umum",
        category: "Pengurus Inti",
        gender: "Laki-laki",
        sortOrder: 3,
      }
    ]).onConflictDoNothing();

    console.log("Seeding complete.");
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  try {
    await seedDatabase();
  } catch (err) {
    console.error("Error seeding database:", err);
  }

  // ---- PUBLIC API ROUTES ----
  app.get("/api/activities", async (req, res) => {
    try {
      const data = await db.select().from(activities).orderBy(desc(activities.date));
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch activities", details: e.message });
    }
  });

  app.get("/api/activities/:id", async (req, res) => {
    try {
      const activity = await db.select().from(activities).where(eq(activities.id, req.params.id));
      if (!activity.length) return res.status(404).json({ error: "Not found" });
      const images = await db.select().from(activityImages).where(eq(activityImages.activityId, req.params.id));
      res.json({ ...activity[0], images });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch activity", details: e.message });
    }
  });

  app.get("/api/achievements", async (req, res) => {
    try {
      const data = await db.select().from(achievements).orderBy(desc(achievements.year));
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch achievements", details: e.message });
    }
  });

  app.get("/api/organization", async (req, res) => {
    try {
      const data = await db.select().from(organizationMembers).orderBy(organizationMembers.sortOrder);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch organization", details: e.message });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const data = await db.select().from(siteSettings).where(eq(siteSettings.id, "default"));
      res.json(data[0] || null);
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch settings", details: e.message });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const activitiesData = await db.select().from(activities);
      const achievementsData = await db.select().from(achievements);
      const membersData = await db.select().from(organizationMembers);
      res.json({
        totalActivities: activitiesData.length,
        totalAchievements: achievementsData.length,
        totalMembers: membersData.length,
      });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch stats", details: e.message });
    }
  });

  // ---- PROTECTED API ROUTES ----
  app.post("/api/activities", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id, title, slug, description, category, date, coverImage } = req.body;
      await db.insert(activities).values({ id, title, slug, description, category, date: new Date(date), coverImage });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to create activity", details: e.message });
    }
  });

  app.put("/api/activities/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { title, description, category, date, coverImage } = req.body;
      await db.update(activities)
        .set({ title, description, category, date: new Date(date), coverImage, updatedAt: new Date() })
        .where(eq(activities.id, req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to update activity", details: e.message });
    }
  });

  app.delete("/api/activities/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      await db.delete(activities).where(eq(activities.id, req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to delete activity", details: e.message });
    }
  });

  app.post("/api/activities/:id/images", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id: imageId, imageUrl } = req.body;
      await db.insert(activityImages).values({ id: imageId, activityId: req.params.id, imageUrl });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to add image", details: e.message });
    }
  });

  app.delete("/api/images/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      await db.delete(activityImages).where(eq(activityImages.id, req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to delete image", details: e.message });
    }
  });

  app.post("/api/achievements", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id, title, event, description, level, year, winner, imageUrl } = req.body;
      await db.insert(achievements).values({ id, title, event, description, level, year: parseInt(year), winner, imageUrl });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to create achievement", details: e.message });
    }
  });

  app.put("/api/achievements/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { title, event, description, level, year, winner, imageUrl } = req.body;
      await db.update(achievements)
        .set({ title, event, description, level, year: parseInt(year), winner, imageUrl, updatedAt: new Date() })
        .where(eq(achievements.id, req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to update achievement", details: e.message });
    }
  });

  app.delete("/api/achievements/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      await db.delete(achievements).where(eq(achievements.id, req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to delete achievement", details: e.message });
    }
  });

  app.post("/api/organization", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id, name, position, category, gender, photoUrl, description, sortOrder } = req.body;
      await db.insert(organizationMembers).values({ id, name, position, category, gender, photoUrl, description, sortOrder: parseInt(sortOrder) || 0 });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to create member", details: e.message });
    }
  });

  app.put("/api/organization/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { name, position, category, gender, photoUrl, description, sortOrder } = req.body;
      await db.update(organizationMembers)
        .set({ name, position, category, gender, photoUrl, description, sortOrder: parseInt(sortOrder) || 0, updatedAt: new Date() })
        .where(eq(organizationMembers.id, req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to update member", details: e.message });
    }
  });

  app.delete("/api/organization/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      await db.delete(organizationMembers).where(eq(organizationMembers.id, req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to delete member", details: e.message });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express v4 wildcard matching
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
