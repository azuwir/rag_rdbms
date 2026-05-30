import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateAnswer, generateSql } from "@/lib/rag";
import { enforceSelectOnly, ensureLimit } from "@/lib/sqlGuard";

const BodySchema = z.object({
  question: z.string().min(3),
});

export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await req.json());

    const sqlGen = await generateSql(body.question);
    const safeSql = ensureLimit(enforceSelectOnly(sqlGen.sql), 200);

    const rows = (await prisma.$queryRawUnsafe(safeSql)) as unknown[];

    let chartSql: string | null = null;
    let chartRows: unknown[] | null = null;
    if (sqlGen.chart_sql) {
      try {
        chartSql = ensureLimit(enforceSelectOnly(sqlGen.chart_sql), 200);
        chartRows = (await prisma.$queryRawUnsafe(chartSql)) as unknown[];
      } catch {
        // Jika chart_sql gagal, jangan gagalkan request utama.
        chartSql = null;
        chartRows = null;
      }
    }

    const answer = await generateAnswer({
      question: body.question,
      sql: safeSql,
      rows: Array.isArray(rows) ? rows : [],
    });

    return NextResponse.json({
      ok: true,
      question: body.question,
      sql: safeSql,
      chartSql,
      note: sqlGen.note ?? null,
      rows,
      chartRows,
      answer,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
