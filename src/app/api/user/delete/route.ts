import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getStorageProvider } from "@/lib/storage";

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const storage = getStorageProvider();

    // 1. Fetch user's generation assets to purge from storage
    const assets = await prisma.asset.findMany({
      where: {
        generation: {
          userId: user.id,
        },
      },
    });

    for (const asset of assets) {
      try {
        await storage.deleteAsset(asset.storageKey);
      } catch (e) {
        console.warn("Storage deletion warning:", e);
      }
    }

    // 2. Cascade delete User record (cascades characters, generations, assets, subscriptions, tokens)
    await prisma.user.delete({
      where: { id: user.id },
    });

    const response = NextResponse.json({
      success: true,
      message: "Your account and all associated data have been permanently erased.",
    });

    response.cookies.delete("nudy_token");
    return response;
  } catch (err: any) {
    console.error("Account deletion error:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
