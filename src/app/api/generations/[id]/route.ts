import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateGenerationSchema = z.object({
  isFavorite: z.boolean().optional(),
  collectionName: z.string().max(50).optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const generation = await prisma.generation.findFirst({
      where: {
        id: params.id,
        userId: user.id, // Strictly private to creator
      },
      include: {
        assets: true,
        character: true,
        jobs: true,
      },
    });

    if (!generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    return NextResponse.json({ generation });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch generation" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.generation.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateGenerationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update data" }, { status: 400 });
    }

    const updated = await prisma.generation.update({
      where: { id: params.id },
      data: parsed.data,
      include: { assets: true },
    });

    return NextResponse.json({ generation: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update generation" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.generation.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    // Cascade deletes assets & jobs
    await prisma.generation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Generation and assets deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete generation" }, { status: 500 });
  }
}
