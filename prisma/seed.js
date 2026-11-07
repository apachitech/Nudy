const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany({});
  await prisma.moderationAction.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.creditsLedger.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.generation.deleteMany({});
  await prisma.character.deleteMany({});
  await prisma.verificationRecord.deleteMany({});
  await prisma.user.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash("AdminPassword18+!", salt);
  const creatorPasswordHash = await bcrypt.hash("CreatorPassword18+!", salt);
  const userPasswordHash = await bcrypt.hash("UserPassword18+!", salt);

  // 1. Admin User
  const admin = await prisma.user.create({
    data: {
      email: "admin@nudy.local",
      name: "Admin Moderator",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isAgeVerified: true,
      creditBalance: 1000,
      verificationRecords: {
        create: {
          provider: "mock",
          providerReference: "MOCK-KYC-ADMIN-001",
          status: "APPROVED",
          idDocumentType: "PASSPORT",
          verifiedAge: 32,
          documentHash: "hash-admin-kyc-verified-2026",
        },
      },
    },
  });

  // 2. Verified Creator User
  const creator = await prisma.user.create({
    data: {
      email: "creator@nudy.local",
      name: "Veronica Vance",
      passwordHash: creatorPasswordHash,
      role: "USER",
      isAgeVerified: true,
      creditBalance: 250,
      verificationRecords: {
        create: {
          provider: "mock",
          providerReference: "MOCK-KYC-CREATOR-002",
          status: "APPROVED",
          idDocumentType: "DRIVERS_LICENSE",
          verifiedAge: 25,
          documentHash: "hash-creator-kyc-verified-2026",
        },
      },
    },
  });

  // 3. Unverified User (For testing Age Gate & KYC enforcement)
  const unverifiedUser = await prisma.user.create({
    data: {
      email: "newuser@nudy.local",
      name: "New Unverified",
      passwordHash: userPasswordHash,
      role: "USER",
      isAgeVerified: false,
      creditBalance: 50,
    },
  });

  // 4. Initial Credits Ledger
  await prisma.creditsLedger.createMany({
    data: [
      {
        userId: admin.id,
        amount: 1000,
        balanceAfter: 1000,
        transactionType: "SIGNUP_BONUS",
        description: "Admin initial allocation",
      },
      {
        userId: creator.id,
        amount: 250,
        balanceAfter: 250,
        transactionType: "PURCHASE",
        description: "Initial Pro creator bundle",
      },
      {
        userId: unverifiedUser.id,
        amount: 50,
        balanceAfter: 50,
        transactionType: "SIGNUP_BONUS",
        description: "Free onboarding credit grant",
      },
    ],
  });

  // 5. Subscription for Creator
  const periodStart = new Date();
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  await prisma.subscription.create({
    data: {
      userId: creator.id,
      tier: "CREATOR",
      status: "ACTIVE",
      creditsMonthly: 500,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      providerSubscriptionId: "sub_mock_creator_9981",
    },
  });

  // 6. Character Profiles (All apparent age strictly >= 21)
  const charElena = await prisma.character.create({
    data: {
      userId: creator.id,
      name: "Elena Vance",
      apparentAge: 24, // Enforced >= 21
      gender: "female",
      bodyType: "hourglass athletic",
      hairStyle: "long layered dark waves",
      hairColor: "raven black",
      eyeColor: "emerald green",
      ethnicity: "Caucasian",
      faceFeatures: "high cheekbones, subtle lip gloss, elegant expression",
      outfit: "midnight satin corset and tailored silk trousers",
      personality: "confident, alluring, sophisticated, artistic",
      setting: "penthouse balcony overlooking a rainy neon city",
      defaultPrompt: "masterpiece, 8k, photorealistic, cinematic lighting, shallow depth of field",
      negativePrompt: "lowres, bad anatomy, deformed, extra limbs, blur, cartoon",
      baseSeed: 914285,
    },
  });

  const charAria = await prisma.character.create({
    data: {
      userId: creator.id,
      name: "Aria Thorne",
      apparentAge: 22, // Enforced >= 21
      gender: "female",
      bodyType: "toned athletic",
      hairStyle: "sharp asymmetrical bob",
      hairColor: "platinum blonde with subtle pastel highlights",
      eyeColor: "sapphire blue",
      ethnicity: "Scandinavian",
      faceFeatures: "expressive eyes, sharp jawline, playful smirk",
      outfit: "high-collar cyberpunk streetwear jacket over sleek bodysuit",
      personality: "rebellious, vibrant, tech-savvy, adventurous",
      setting: "rooftop garden glowing in purple sunset neon",
      defaultPrompt: "stunning realism, volumetric lighting, photorealistic skin texture, raytracing",
      negativePrompt: "ugly, malformed, extra fingers, noisy, watermarks",
      baseSeed: 418293,
    },
  });

  // 7. Seed Initial Generations & Private Assets
  const genElena = await prisma.generation.create({
    data: {
      userId: creator.id,
      characterId: charElena.id,
      type: "IMAGE",
      prompt: "Elena Vance standing on a luxury penthouse balcony at twilight, wearing midnight satin, cinematic soft ambient glow, natural skin texture, 8k",
      negativePrompt: "deformed, blurry, bad hands, cartoon",
      stylePreset: "realistic",
      aspectRatio: "3:4",
      seed: charElena.baseSeed,
      numOutputs: 1,
      resolution: "896x1152",
      status: "COMPLETED",
      costCredits: 2,
      isFavorite: true,
      collectionName: "Portraits",
      assets: {
        create: {
          storageKey: `generations/${creator.id}/elena_balcony_twilight.jpg`,
          storageProvider: "mock",
          url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80",
          mimeType: "image/jpeg",
          fileSizeBytes: 1420500,
          width: 896,
          height: 1152,
          sha256Hash: "mock-hash-elena-01",
        },
      },
      jobs: {
        create: {
          status: "COMPLETED",
          progress: 100,
          stepDescription: "Generation finished successfully",
          workerId: "mock-worker-01",
          startedAt: new Date(Date.now() - 60000),
          completedAt: new Date(),
        },
      },
    },
  });

  const genAria = await prisma.generation.create({
    data: {
      userId: creator.id,
      characterId: charAria.id,
      type: "IMAGE",
      prompt: "Aria Thorne in vibrant neon street lighting, platinum blonde bob, expressive blue eyes, photorealistic detail",
      negativePrompt: "ugly, blurry, low quality",
      stylePreset: "realistic",
      aspectRatio: "1:1",
      seed: charAria.baseSeed,
      numOutputs: 1,
      resolution: "1024x1024",
      status: "COMPLETED",
      costCredits: 2,
      isFavorite: false,
      collectionName: "Cyberpunk",
      assets: {
        create: {
          storageKey: `generations/${creator.id}/aria_neon_street.jpg`,
          storageProvider: "mock",
          url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80",
          mimeType: "image/jpeg",
          fileSizeBytes: 1250300,
          width: 1024,
          height: 1024,
          sha256Hash: "mock-hash-aria-01",
        },
      },
      jobs: {
        create: {
          status: "COMPLETED",
          progress: 100,
          stepDescription: "Completed",
          workerId: "mock-worker-01",
          startedAt: new Date(Date.now() - 40000),
          completedAt: new Date(),
        },
      },
    },
  });

  // Seed sample Video Generation
  await prisma.generation.create({
    data: {
      userId: creator.id,
      characterId: charElena.id,
      type: "VIDEO",
      prompt: "Elena Vance turning towards the camera with a gentle breeze moving her hair, penthouse balcony, city lights blurred in background",
      negativePrompt: "jitter, fast movement, low quality, artifacts",
      stylePreset: "realistic",
      aspectRatio: "16:9",
      seed: 884712,
      numOutputs: 1,
      videoDuration: 4.0,
      motionStrength: 0.65,
      resolution: "1280x720",
      status: "COMPLETED",
      costCredits: 10,
      isFavorite: true,
      collectionName: "Video Motion",
      assets: {
        create: {
          storageKey: `generations/${creator.id}/elena_breeze_motion.mp4`,
          storageProvider: "mock",
          url: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-neon-light-39875-large.mp4",
          mimeType: "video/mp4",
          fileSizeBytes: 6540200,
          width: 1280,
          height: 720,
          duration: 4.0,
          sha256Hash: "mock-hash-video-elena-01",
        },
      },
      jobs: {
        create: {
          status: "COMPLETED",
          progress: 100,
          stepDescription: "Video rendering complete",
          workerId: "mock-worker-01",
          startedAt: new Date(Date.now() - 120000),
          completedAt: new Date(),
        },
      },
    },
  });

  // 8. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: "ADMIN_SEED_INIT",
        metadata: JSON.stringify({ note: "Initial system seeding complete" }),
      },
      {
        userId: creator.id,
        action: "KYC_VERIFIED",
        metadata: JSON.stringify({ verifiedAge: 25, provider: "mock" }),
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log("👥 Test Accounts Created:");
  console.log("   Admin:      admin@nudy.local      / AdminPassword18+!   (Verified, 1000 credits)");
  console.log("   Creator:    creator@nudy.local    / CreatorPassword18+! (Verified, 250 credits)");
  console.log("   Unverified: newuser@nudy.local    / UserPassword18+!    (Unverified, 50 credits)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
