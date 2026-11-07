/**
 * End-to-End Flow Verification Script
 * Tests:
 * 1. User Signup
 * 2. Unverified generation block (KYC gate)
 * 3. Prompt safety moderation block (underage violation)
 * 4. KYC verification stub completion
 * 5. Character creation (apparent age >= 21)
 * 6. Image generation dispatch & credit deduction
 * 7. Video generation dispatch & credit deduction
 * 8. Private gallery retrieval
 * 9. Generation favoriting
 * 10. GDPR personal data export
 * 11. Content reporting and admin moderation review queue
 */

const BASE_URL = process.env.TEST_APP_URL || "http://localhost:3000";

async function runE2ETest() {
  console.log("🚀 Starting End-to-End Integration Verification on", BASE_URL);

  const timestamp = Date.now();
  const testEmail = `e2e_user_${timestamp}@nudy.local`;
  const testPassword = "PasswordSecure18+!";
  let userToken = "";
  let userId = "";
  let characterId = "";
  let generationId = "";

  // Helper for requests
  async function api(path, method = "GET", body = null, token = null) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  // 1. Signup
  console.log("\n[1/11] 📝 Testing User Registration...");
  const signupRes = await api("/api/auth/signup", "POST", {
    email: testEmail,
    password: testPassword,
    name: "E2E Test Creator",
    confirmAge: true,
  });

  if (!signupRes.ok || !signupRes.data.token) {
    throw new Error(`Signup failed: ${JSON.stringify(signupRes.data)}`);
  }
  userToken = signupRes.data.token;
  userId = signupRes.data.user.id;
  console.log("   ✅ User created:", testEmail, "| Initial credits:", signupRes.data.user.creditBalance);

  // 2. Unverified Generation Gate Test
  console.log("\n[2/11] 🛡️ Testing KYC Age Gate (attempting generation while unverified)...");
  const unverifiedGenRes = await api(
    "/api/generate",
    "POST",
    {
      prompt: "Glamour portrait of adult fictional woman",
      type: "IMAGE",
    },
    userToken
  );

  if (unverifiedGenRes.status === 403 && unverifiedGenRes.data.code === "KYC_REQUIRED") {
    console.log("   ✅ Properly blocked by KYC enforcement! (HTTP 403 Forbidden: KYC Required)");
  } else {
    throw new Error(`Expected HTTP 403 KYC_REQUIRED, got: ${unverifiedGenRes.status}`);
  }

  // 3. Prompt Safety Filter Test
  console.log("\n[3/11] 🚨 Testing Zero-Tolerance Prompt Moderation (attempting underage prompt)...");
  // First verify user to test prompt filter specifically
  await api("/api/kyc/verify", "POST", { idDocumentType: "PASSPORT" }, userToken);

  const blockedGenRes = await api(
    "/api/generate",
    "POST",
    {
      prompt: "A 15yo teenager in a high school classroom",
      type: "IMAGE",
    },
    userToken
  );

  if (blockedGenRes.status === 400 && blockedGenRes.data.code === "SAFETY_FILTER_TRIGGERED") {
    console.log("   ✅ Properly blocked by Safety Filter! (HTTP 400: Underage prompt rejected)");
    console.log("      Reason:", blockedGenRes.data.error);
  } else {
    throw new Error(`Expected prompt filter to block, got: ${blockedGenRes.status}`);
  }

  // 4. KYC Status Check
  console.log("\n[4/11] 🔍 Verifying User 18+ KYC Status...");
  const meRes = await api("/api/auth/me", "GET", null, userToken);
  if (!meRes.data.user?.isAgeVerified) {
    throw new Error("User should be age verified after KYC completion");
  }
  console.log("   ✅ User successfully verified (isAgeVerified: true)");

  // 5. Character Creation
  console.log("\n[5/11] 🎨 Creating Persistent Adult Character Profile (apparent age 24)...");
  const charRes = await api(
    "/api/characters",
    "POST",
    {
      name: "Sabrina Stone",
      apparentAge: 24, // Min 21 in UI
      gender: "female",
      bodyType: "hourglass athletic",
      hairColor: "auburn",
      hairStyle: "long flowing waves",
      eyeColor: "hazel",
      outfit: "burgundy satin evening wrap",
      personality: "sophisticated, mysterious, alluring",
      setting: "penthouse library with fireplace",
      baseSeed: 772183,
    },
    userToken
  );

  if (!charRes.ok || !charRes.data.character) {
    throw new Error(`Character creation failed: ${JSON.stringify(charRes.data)}`);
  }
  characterId = charRes.data.character.id;
  console.log("   ✅ Character created:", charRes.data.character.name, "| Seed:", charRes.data.character.baseSeed);

  // 6. Image Generation
  console.log("\n[6/11] 🖼️ Generating Fictional Character Image...");
  const imgGenRes = await api(
    "/api/generate",
    "POST",
    {
      characterId,
      type: "IMAGE",
      prompt: "Sabrina Stone sitting gracefully in velvet armchair by the fireplace, dramatic cinematic lighting, 8k",
      stylePreset: "realistic",
      aspectRatio: "3:4",
      numOutputs: 1,
    },
    userToken
  );

  if (!imgGenRes.ok || !imgGenRes.data.generation) {
    throw new Error(`Image generation failed: ${JSON.stringify(imgGenRes.data)}`);
  }
  generationId = imgGenRes.data.generation.id;
  const asset = imgGenRes.data.assets[0];
  console.log("   ✅ Image generated! Generation ID:", generationId);
  console.log("      Asset URL:", asset.url);
  console.log("      Remaining Credits:", imgGenRes.data.remainingCredits);

  // 7. Video Motion Generation
  console.log("\n[7/11] 🎬 Generating Character Motion Video...");
  const vidGenRes = await api(
    "/api/generate",
    "POST",
    {
      characterId,
      type: "VIDEO",
      prompt: "Sabrina Stone turning to look at the camera with gentle firelight illumination, subtle wind motion",
      stylePreset: "realistic",
      aspectRatio: "16:9",
      videoDuration: 4.0,
      motionStrength: 0.65,
    },
    userToken
  );

  if (!vidGenRes.ok || !vidGenRes.data.generation) {
    throw new Error(`Video generation failed: ${JSON.stringify(vidGenRes.data)}`);
  }
  console.log("   ✅ Video generated! Video Asset URL:", vidGenRes.data.assets[0]?.url);
  console.log("      Remaining Credits:", vidGenRes.data.remainingCredits);

  // 8. Gallery Fetch
  console.log("\n[8/11] 📁 Querying Private Gallery...");
  const galleryRes = await api("/api/generations", "GET", null, userToken);
  if (!galleryRes.ok || galleryRes.data.generations?.length < 2) {
    throw new Error("Expected at least 2 generations in gallery");
  }
  console.log(`   ✅ Gallery returned ${galleryRes.data.generations.length} items (Private to creator)`);

  // 9. Favorite Toggle
  console.log("\n[9/11] ❤️ Favoriting Generation...");
  const favRes = await api(
    `/api/generations/${generationId}`,
    "PATCH",
    { isFavorite: true },
    userToken
  );
  if (!favRes.ok || !favRes.data.generation?.isFavorite) {
    throw new Error("Failed to favorite generation");
  }
  console.log("   ✅ Generation successfully favorited");

  // 10. GDPR Data Export
  console.log("\n[10/11] 📦 Testing GDPR/CCPA User Data Export...");
  const exportRes = await api("/api/user/export", "GET", null, userToken);
  if (!exportRes.ok || !exportRes.data.email) {
    throw new Error("Data export failed");
  }
  console.log("   ✅ Data export generated! Contains:", Object.keys(exportRes.data).join(", "));

  // 11. Content Reporting & Admin Moderation Queue
  console.log("\n[11/11] 🛡️ Submitting Content Report & Checking Admin Moderation Queue...");
  const reportRes = await api(
    "/api/reports",
    "POST",
    {
      generationId,
      reason: "POTENTIAL_UNDERAGE_APPEARANCE",
      details: "Test automated compliance verification report",
    },
    userToken
  );
  if (!reportRes.ok) throw new Error("Report submission failed");
  console.log("   ✅ Report submitted (Report ID:", reportRes.data.reportId, ")");

  // Login as seeded Admin to verify moderation queue
  const adminLogin = await api("/api/auth/login", "POST", {
    email: "admin@nudy.local",
    password: "AdminPassword18+!",
  });
  if (!adminLogin.ok) throw new Error("Admin login failed");
  const adminToken = adminLogin.data.token;

  const adminQueue = await api("/api/admin/reports", "GET", null, adminToken);
  if (!adminQueue.ok || adminQueue.data.reports?.length === 0) {
    throw new Error("Admin report queue empty");
  }
  console.log(`   ✅ Admin successfully retrieved moderation queue (${adminQueue.data.reports.length} reports, ${adminQueue.data.recentAuditLogs?.length} audit entries)`);

  console.log("\n🎉 ALL 11 END-TO-END FLOW TESTS COMPLETED SUCCESSFULLY!");
}

runE2ETest().catch((err) => {
  console.error("\n❌ E2E Test Suite Error:", err);
  process.exit(1);
});

