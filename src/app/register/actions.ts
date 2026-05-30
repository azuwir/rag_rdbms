"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const RegisterSchema = z.object({
  name: z.string().min(2).max(50).optional().or(z.literal("")),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export type RegisterState =
  | { ok: true }
  | { ok: false; error: string };

export async function registerAction(
  _prev: RegisterState | null,
  formData: FormData
): Promise<RegisterState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Input tidak valid. Pastikan email benar dan password minimal 6.",
    };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "Email sudah terdaftar. Silakan login." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      name: name ? String(name) : null,
      passwordHash,
    },
  });

  return { ok: true };
}
