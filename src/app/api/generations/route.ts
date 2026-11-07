import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get("characterId");
    const type = searchParams.get("type"); // IMAGE or VIDEO
    const collection = searchParams.get("collection");
    const favoriteOnly = searchParams.get("favoriteOnly") === "true";

    const where: any = {
      userId: user.id, // Strictly scoped to creator
    };

    if (characterId) where.characterId = characterId;
    if (type) where.type = type;
    if (collection) where.collectionName = collection;
    if (favoriteOnly) where.isFavorite = true;

    const generations = await prisma.generation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        assets: true,
        character: {
          select: {
            id: true,
            name: true,
            apparentAge: true,
          },
        },
      },
    });

    return NextResponse.json({ generations });
  } catch (err: any) {
    console.error("Generations GET error:", err);
    return NextResponse.json({ error: "Failed to load generations" }, { status: 500 });
  }
}
