import "dotenv/config";
import cors from "cors";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import mongoose from "mongoose";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDatabase } from "./db.js";
import { requireUser } from "./auth.js";
import {
  Comment,
  Event,
  Follow,
  Friendship,
  Like,
  Project,
  RSVP,
  SavedProject,
  Share,
  User,
} from "./models/index.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(root, "..");
const app = express();
const httpServer = createServer(app);
const port = Number(process.env.PORT || 5173);
let databaseReady = false;
const allowedOrigins = [
  ...(process.env.CLERK_AUTHORIZED_PARTIES || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  process.env.CLERK_AUTHORIZED_PARTY,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
].filter(
  (origin, index, origins) => origin && origins.indexOf(origin) === index,
);
app.use(
  clerkMiddleware({
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
    authorizedParties: allowedOrigins,
  }),
);
app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.get("/api/health", (_req, res) =>
  res.json({ api: "ready", database: databaseReady ? "ready" : "connecting" }),
);
app.use("/api", (_req, res, next) => {
  if (!databaseReady || mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database is connecting. Try again in a few seconds.",
    });
  }
  next();
});

const serialize = (doc) =>
  doc ? { ...doc.toObject(), id: doc._id.toString() } : null;

async function seedDemoData() {
  const demoUsers = [
    {
      id: "maya",
      name: "Maya Chen",
      handle: "@mayachen",
      image: "assets/dummy-profile-01.png",
      bio: "Building a campus rover and learning robotics.",
    },
    {
      id: "sam",
      name: "Sam Rivera",
      handle: "@samrivera",
      image: "assets/dummy-profile-02.png",
      bio: "Making small electronics projects with ESP32.",
    },
    {
      id: "jordan",
      name: "Jordan Lee",
      handle: "@jordanlee",
      image: "assets/dummy-profile-03.png",
      bio: "Creative experiments and student tools.",
    },
    {
      id: "noah",
      name: "Noah Williams",
      handle: "@noahwilliams",
      image: "assets/dummy-profile-04.png",
      bio: "Testing ideas in IoT and embedded systems.",
    },
  ];
  await Promise.all(
    demoUsers.map(({ id, ...profile }) =>
      User.updateOne(
        { clerkId: `demo:${id}` },
        {
          $setOnInsert: {
            ...profile,
            clerkId: `demo:${id}`,
            email: `${id}@example.test`,
          },
        },
        { upsert: true },
      ),
    ),
  );

  const projects = [
    {
      author: "maya",
      title: "I built this campus rover",
      text: "I built this small rover for my robotics class. I want help with smoother turns and better obstacle sensing.",
      location: "IIT Delhi",
      image: "assets/project-rover.png",
    },
    {
      author: "sam",
      title: "I need help with this circuit",
      text: "I am testing a smart lamp with an ESP32. Can someone help me find why the relay keeps dropping?",
      location: "BITS Pilani",
      image: "assets/project-circuit.png",
    },
    {
      author: "jordan",
      title: "I am building a study app",
      text: "I am building a simple study planner for students. I want feedback on the first screen and the flow.",
      location: "VIT Vellore",
      image: "assets/project-workbench.png",
    },
    {
      author: "noah",
      title: "I am testing a smart lamp",
      text: "I am testing an IoT lamp with a relay and an ESP32. I want help checking the wiring before I make the next version.",
      location: "NIT Trichy",
      image: "assets/project-iot.png",
    },
  ];
  await Promise.all(
    projects.map(({ author, ...project }) =>
      Project.updateOne(
        { author: `demo:${author}`, title: project.title },
        { $setOnInsert: { ...project, author: `demo:${author}` } },
        { upsert: true },
      ),
    ),
  );

  const events = [
    {
      host: "maya",
      title: "Robotics project help",
      category: "Build session",
      date: "2026-12-06T10:00:00+05:30",
      location: "IIT Delhi · Innovation Lab",
      text: "Bring your robot, your wiring, or your questions. We will test ideas together.",
      image: "assets/event-iit-delhi.png",
    },
    {
      host: "jordan",
      title: "Student project showcase",
      category: "Show and tell",
      date: "2026-12-12T14:00:00+05:30",
      location: "Online",
      text: "Show what you built, ask for feedback, and find people who want to help.",
      image: "assets/event-workshop.png",
    },
  ];
  await Promise.all(
    events.map(({ host, ...event }) =>
      Event.updateOne(
        { host: `demo:${host}`, title: event.title },
        { $setOnInsert: { ...event, host: `demo:${host}` } },
        { upsert: true },
      ),
    ),
  );
}

app.get("/api/bootstrap", requireUser, async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const [
      users,
      projects,
      events,
      likes,
      saves,
      shares,
      rsvps,
      friends,
      follows,
      comments,
    ] = await Promise.all([
      User.find().lean(),
      Project.find().sort({ createdAt: -1 }).lean(),
      Event.find().sort({ date: 1 }).lean(),
      Like.find().lean(),
      SavedProject.find().lean(),
      Share.find().lean(),
      RSVP.find().lean(),
      Friendship.find({ userId }).lean(),
      Follow.find().lean(),
      Comment.find().lean(),
    ]);
    const projectCards = projects.map((item) => ({
      ...item,
      id: String(item._id),
      likes: likes.filter((like) => String(like.targetId) === String(item._id))
        .length,
      saves: saves.filter((save) => String(save.targetId) === String(item._id))
        .length,
      shares: shares.filter(
        (share) => String(share.targetId) === String(item._id),
      ).length,
      comments: comments.filter(
        (comment) => String(comment.projectId) === String(item._id),
      ).length,
      commentItems: comments
        .filter((comment) => String(comment.projectId) === String(item._id))
        .map((comment) => ({ ...comment, id: String(comment._id) })),
    }));
    const eventCards = events.map((item) => ({
      ...item,
      id: String(item._id),
      going: rsvps.filter((rsvp) => String(rsvp.targetId) === String(item._id))
        .length,
    }));
    res.json({
      users: users.map((item) => ({
        clerkId: item.clerkId,
        name: item.name,
        handle: item.handle,
        image: item.image,
        banner: item.banner,
        bio: item.bio,
        email: item.email,
        affiliation: item.affiliation,
        contact: item.contact,
        experience: item.experience || [],
        education: item.education || [],
        skills: item.skills || [],
        id: item.clerkId || String(item._id),
        followers: follows.filter(
          (follow) => follow.targetUserId === item.clerkId,
        ).length,
        following: follows.filter((follow) => follow.userId === item.clerkId)
          .length,
      })),
      posts: projectCards,
      events: eventCards,
      activity: {
        likes: likes
          .filter((item) => item.userId === userId)
          .map((item) => String(item.targetId)),
        saved: saves
          .filter((item) => item.userId === userId)
          .map((item) => String(item.targetId)),
        events: rsvps
          .filter((item) => item.userId === userId)
          .map((item) => String(item.targetId)),
        friends: friends.map((item) => item.friendId),
        following: follows
          .filter((item) => item.userId === userId)
          .map((item) => item.targetUserId),
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/updates", requireUser, async (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  res.write("event: ready\ndata: {}\n\n");

  const changes = mongoose.connection.watch([], {
    fullDocument: "updateLookup",
  });
  const heartbeat = setInterval(() => res.write(": keep-alive\n\n"), 20000);
  changes.on("change", () => res.write("event: changed\ndata: {}\n\n"));
  changes.on("error", () => res.end());
  res.on("close", () => {
    clearInterval(heartbeat);
    changes.close().catch(() => {});
  });
});

app.post("/api/profile/sync", requireUser, async (req, res, next) => {
  try {
    const { email, name, image } = req.body;
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    if (!normalizedEmail)
      return res.status(400).json({ error: "Email is required" });
    const profile = await User.findOneAndUpdate(
      { clerkId: req.auth.userId },
      {
        $set: { email: normalizedEmail, handle: `@${normalizedEmail}` },
        $setOnInsert: {
          clerkId: req.auth.userId,
          name: name || normalizedEmail.split("@")[0],
          image: image || "",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res.json(serialize(profile));
  } catch (error) {
    next(error);
  }
});
app.patch("/api/profile", requireUser, async (req, res, next) => {
  try {
    const profile = await User.findOneAndUpdate(
      { clerkId: req.auth.userId },
      {
        $set: {
          name: req.body.name,
          bio: req.body.bio,
          banner: req.body.banner || "",
          image: req.body.image || "",
          affiliation: req.body.affiliation || "",
          contact: req.body.contact || "",
          experience: Array.isArray(req.body.experience)
            ? req.body.experience.slice(0, 20)
            : [],
          education: Array.isArray(req.body.education)
            ? req.body.education.slice(0, 20)
            : [],
          skills: Array.isArray(req.body.skills)
            ? req.body.skills.slice(0, 40)
            : [],
        },
      },
      { new: true, runValidators: true },
    );
    res.json(serialize(profile));
  } catch (error) {
    next(error);
  }
});
app.post("/api/projects", requireUser, async (req, res, next) => {
  try {
    const project = await Project.create({
      ...req.body,
      author: req.auth.userId,
    });
    res.status(201).json(serialize(project));
  } catch (error) {
    next(error);
  }
});
app.delete("/api/projects/:id", requireUser, async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      author: req.auth.userId,
    });
    if (project) {
      await Promise.all([
        Like.deleteMany({ targetId: project._id }),
        SavedProject.deleteMany({ targetId: project._id }),
        Share.deleteMany({ targetId: project._id }),
        Comment.deleteMany({ projectId: project._id }),
      ]);
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
app.patch("/api/projects/:id", requireUser, async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, author: req.auth.userId },
      {
        $set: {
          title: req.body.title,
          text: req.body.text,
          location: req.body.location,
          image: req.body.image,
        },
      },
      { new: true, runValidators: true },
    );
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(serialize(project));
  } catch (error) {
    next(error);
  }
});
app.post("/api/events", requireUser, async (req, res, next) => {
  try {
    const event = await Event.create({ ...req.body, host: req.auth.userId });
    res.status(201).json(serialize(event));
  } catch (error) {
    next(error);
  }
});
app.delete("/api/events/:id", requireUser, async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      host: req.auth.userId,
    });
    if (event) await RSVP.deleteMany({ targetId: event._id });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
app.patch("/api/events/:id", requireUser, async (req, res, next) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, host: req.auth.userId },
      {
        $set: {
          title: req.body.title,
          category: req.body.category,
          date: req.body.date,
          location: req.body.location,
          text: req.body.text,
          image: req.body.image,
        },
      },
      { new: true, runValidators: true },
    );
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(serialize(event));
  } catch (error) {
    next(error);
  }
});
app.post("/api/interaction", requireUser, async (req, res, next) => {
  try {
    const { action, id, enabled } = req.body;
    const collection = {
      like: Like,
      save: SavedProject,
      share: Share,
      rsvp: RSVP,
    }[action];
    if (action === "friend") {
      const friendId = String(id || "");
      if (!friendId || friendId === req.auth.userId)
        return res
          .status(400)
          .json({ error: "Choose another community member" });
      if (enabled && !(await User.exists({ clerkId: friendId })))
        return res.status(404).json({ error: "Community member not found" });
      if (enabled)
        await Friendship.updateOne(
          { userId: req.auth.userId, friendId },
          { $setOnInsert: { userId: req.auth.userId, friendId } },
          { upsert: true },
        );
      else await Friendship.deleteOne({ userId: req.auth.userId, friendId });
      return res.json({ ok: true });
    }
    if (action === "follow") {
      if (id === req.auth.userId)
        return res.status(400).json({ error: "You cannot follow yourself" });
      if (enabled)
        await Follow.updateOne(
          { userId: req.auth.userId, targetUserId: id },
          { $setOnInsert: { userId: req.auth.userId, targetUserId: id } },
          { upsert: true },
        );
      else
        await Follow.deleteOne({ userId: req.auth.userId, targetUserId: id });
      return res.json({ ok: true });
    }
    if (!collection)
      return res.status(400).json({ error: "Unknown interaction" });
    if (enabled)
      await collection.updateOne(
        { userId: req.auth.userId, targetId: id },
        { $setOnInsert: { userId: req.auth.userId, targetId: id } },
        { upsert: true },
      );
    else await collection.deleteOne({ userId: req.auth.userId, targetId: id });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
app.post("/api/comments", requireUser, async (req, res, next) => {
  try {
    const comment = await Comment.create({
      projectId: req.body.projectId,
      userId: req.auth.userId,
      text: req.body.text,
    });
    res.status(201).json(serialize(comment));
  } catch (error) {
    next(error);
  }
});
app.patch("/api/comments/:id", requireUser, async (req, res, next) => {
  try {
    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      { $set: { text: req.body.text } },
      { new: true, runValidators: true },
    );
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json(serialize(comment));
  } catch (error) {
    next(error);
  }
});
app.delete("/api/comments/:id", requireUser, async (req, res, next) => {
  try {
    await Comment.findOneAndDelete({
      _id: req.params.id,
      userId: req.auth.userId,
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

async function connectWithRetry() {
  while (!databaseReady) {
    try {
      await connectDatabase();
      await seedDemoData();
      databaseReady = true;
      console.log("MongoDB data is ready");
    } catch (error) {
      console.error(
        "MongoDB connection failed. Retrying in 5 seconds:",
        error.message,
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(projectRoot, "dist")));
    app.get(/.*/, (_req, res) =>
      res.sendFile(path.join(projectRoot, "dist", "index.html")),
    );
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: projectRoot,
      configFile: path.join(projectRoot, "vite.config.js"),
      server: { middlewareMode: true, hmr: { server: httpServer } },
      appType: "spa",
    });
    app.use(vite.middlewares);
    httpServer.on("close", () => void vite.close());
  }

  app.use((error, _req, res, next) => {
    void next;
    console.error(error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Unexpected server error" });
  });

  httpServer.listen(port, () =>
    console.log(`Community Like is running at http://localhost:${port}`),
  );
  void connectWithRetry();
}

void startServer();
