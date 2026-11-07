import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  apparentAge: z.number().int().min(18).max(99).optional(),
  gender: z.string().optional(),
  bodyType: z.string().optional(),
  hairStyle: z.string().optional(),
  hairColor: z.string().optional(),
  eyeColor: z.string().optional(),
  ethnicity: z.string().optional(),
  faceFeatures: z.string().optional(),
  outfit: z.string().optional(),
  personality: z.string().optional(),
  setting: z.string().optional(),
  defaultPrompt: z.string().optional(),
  negativePrompt: z.string().optional(),
  baseSeed: z.number().int().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const character = await prisma.character.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        generations: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { assets: true },
        },
      },
    });

    if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 });
    return NextResponse.json({ character });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch character" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.character.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) return NextResponse.json({ error: "Character not found" }, { status: 404 });

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid update" }, { status: 400 });
    }

    const updated = await prisma.character.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ character: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update character" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.character.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) return NextResponse.json({ error: "Character not found" }, { status: 404 });

    await prisma.character.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete character" }, { status: 500 });
  }
}

