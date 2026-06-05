// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MOCK_USERS = [
  {
    name: "Lena Müller",
    email: "lena@example.com",
    handle: "lenadev",
    image: "https://api.dicebear.com/8.x/avataaars/svg?seed=lena",
    bio: "Full-stack dev. Building in public.",
  },
  {
    name: "Arjun Patel",
    email: "arjun@example.com",
    handle: "arjuncodes",
    image: "https://api.dicebear.com/8.x/avataaars/svg?seed=arjun",
    bio: "React enthusiast. Coffee addict.",
  },
  {
    name: "Sofia Romero",
    email: "sofia@example.com",
    handle: "sofiatech",
    image: "https://api.dicebear.com/8.x/avataaars/svg?seed=sofia",
    bio: "UI/UX + frontend engineering.",
  },
];

const MOCK_VIDEOS = [
  {
    title: "Building a REST API with Node.js & Express — Full Tutorial",
    description:
      "In this video, we build a complete REST API from scratch using Node.js, Express, and MongoDB. We cover routing, middleware, authentication with JWT, and deployment to Railway.",
    videoUrl: "https://www.youtube.com/watch?v=fgTGADljAeg",
    thumbnailUrl: "https://picsum.photos/seed/video1/640/360",
    duration: 3842,
    views: 14200,
  },
  {
    title: "Next.js 14 App Router — Everything You Need to Know",
    description:
      "A comprehensive deep-dive into Next.js 14 App Router. Server components, client components, layouts, loading states, error boundaries, and data fetching patterns.",
    videoUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
    thumbnailUrl: "https://picsum.photos/seed/video2/640/360",
    duration: 5120,
    views: 38900,
  },
  {
    title: "Prisma ORM Crash Course — PostgreSQL Setup & CRUD",
    description:
      "Get up and running with Prisma ORM in 45 minutes. We cover schema design, migrations, relations, and common query patterns to avoid N+1 issues.",
    videoUrl: "https://www.youtube.com/watch?v=RebA5J-rlwg",
    thumbnailUrl: "https://picsum.photos/seed/video3/640/360",
    duration: 2760,
    views: 9800,
  },
  {
    title: "TypeScript Generics — Explained Simply",
    description:
      "Generics are the most misunderstood part of TypeScript. In this video I break them down with real-world examples from utility types to custom hooks.",
    videoUrl: "https://www.youtube.com/watch?v=nViEqpgwxHE",
    thumbnailUrl: "https://picsum.photos/seed/video4/640/360",
    duration: 1920,
    views: 22100,
  },
  {
    title: "Docker for Developers — From Zero to Compose",
    description:
      "Learn Docker from the ground up. Containers, images, volumes, networking, and docker-compose for local development. No prior experience needed.",
    videoUrl: "https://www.youtube.com/watch?v=3c-iBn73dDE",
    thumbnailUrl: "https://picsum.photos/seed/video5/640/360",
    duration: 4430,
    views: 51300,
  },
  {
    title: "React Server Components — How They Actually Work",
    description:
      "Server components are the biggest shift in React since hooks. This video explains the mental model, the trade-offs, and how data flows between server and client.",
    videoUrl: "https://www.youtube.com/watch?v=g5BGoLyGjY0",
    thumbnailUrl: "https://picsum.photos/seed/video6/640/360",
    duration: 3310,
    views: 17600,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data in correct order
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.video.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = await Promise.all(
    MOCK_USERS.map((u) => prisma.user.create({ data: u })),
  );
  console.log(`✅ Created ${users.length} users`);

  // Distribute videos across users
  const videos = await Promise.all(
    MOCK_VIDEOS.map((v, i) =>
      prisma.video.create({
        data: { ...v, userId: users[i % users.length].id },
      }),
    ),
  );
  console.log(`✅ Created ${videos.length} videos`);

  // Add some comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        text: "This is exactly what I needed, thank you!",
        userId: users[1].id,
        videoId: videos[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        text: "Great explanation, but I had trouble with the JWT middleware part.",
        userId: users[2].id,
        videoId: videos[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        text: "Could you do a follow-up video on refresh tokens?",
        userId: users[0].id,
        videoId: videos[1].id,
      },
    }),
  ]);

  // Add a reply to first comment
  await prisma.comment.create({
    data: {
      text: "Glad it helped! Refresh token video is coming next week 🙌",
      userId: users[0].id,
      videoId: videos[0].id,
      parentId: comments[0].id,
    },
  });
  console.log("✅ Created comments + replies");

  // Add likes
  await Promise.all([
    prisma.like.create({
      data: { type: "LIKE", userId: users[1].id, videoId: videos[0].id },
    }),
    prisma.like.create({
      data: { type: "LIKE", userId: users[2].id, videoId: videos[0].id },
    }),
    prisma.like.create({
      data: { type: "LIKE", userId: users[0].id, videoId: videos[1].id },
    }),
    prisma.like.create({
      data: { type: "LIKE", userId: users[2].id, videoId: videos[2].id },
    }),
  ]);
  console.log("✅ Created likes");

  // Add subscriptions
  await Promise.all([
    prisma.subscription.create({
      data: { followerId: users[1].id, followingId: users[0].id },
    }),
    prisma.subscription.create({
      data: { followerId: users[2].id, followingId: users[0].id },
    }),
    prisma.subscription.create({
      data: { followerId: users[0].id, followingId: users[2].id },
    }),
  ]);
  console.log("✅ Created subscriptions");

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
