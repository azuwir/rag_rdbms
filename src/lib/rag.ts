import OpenAI from "openai";
import { z } from "zod";

const SqlGenSchema = z.object({
  sql: z.string(),
  note: z.string().optional(),
});

export type SqlGenResult = z.infer<typeof SqlGenSchema>;

function getClient() {
  // Prioritas: SUMOPOD_* → DWIPA_* → OPENAI_* (semuanya OpenAI-compatible)
  const apiKey =
    process.env.SUMOPOD_API_KEY ?? process.env.DWIPA_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey)
    throw new Error("SUMOPOD_API_KEY / DWIPA_API_KEY (atau OPENAI_API_KEY) belum diset.");

  // Base URL yang dipakai SDK biasanya berakhiran /v1 (bukan /v1/chat/completions)
  const baseURL =
    process.env.SUMOPOD_BASE_URL ??
    process.env.DWIPA_BASE_URL ??
    process.env.OPENAI_BASE_URL ??
    "https://ai.sumopod.com/v1";

  return new OpenAI({ apiKey, baseURL });
}

export async function generateSql(question: string): Promise<SqlGenResult> {
  const openai = getClient();
  const model =
    process.env.SUMOPOD_MODEL ??
    process.env.DWIPA_MODEL ??
    process.env.OPENAI_MODEL ??
    "gpt-4o-mini";

  const system = [
    "Kamu adalah asisten yang mengubah pertanyaan user menjadi SQL SELECT untuk PostgreSQL.",
    "",
    "Skema database (tabel dan kolom):",
    "- production(id, plant, month, year, production_target, production_actual)",
    "- revenue(id, plant, month, year, revenue_target, revenue_actual)",
    "- lop(id, plant, month, year, lop_hour, lop_production, lop_revenue)",
    "",
    "Aturan WAJIB:",
    "1) Output HARUS JSON valid: {\"sql\":\"...\",\"note\":\"...\"}.",
    "2) Hanya buat 1 query SQL dan HARUS diawali SELECT.",
    "3) Jangan pakai komentar, jangan pakai titik koma (;), jangan DDL/DML.",
    "4) Gunakan nama tabel persis: production, revenue, lop.",
    "5) Jika pertanyaan meminta ringkasan, gunakan agregasi (SUM/AVG) dan GROUP BY seperlunya.",
    "6) Jika user menyebut plant/bulan/tahun, gunakan filter WHERE (plant, month, year).",
  ].join("\n");

  const resp = await openai.chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: question },
    ],
  });

  const content = resp.choices[0]?.message?.content ?? "{}";
  const parsed = SqlGenSchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    throw new Error("Gagal parsing output SQL dari model.");
  }
  return parsed.data;
}

export async function generateAnswer(args: {
  question: string;
  sql: string;
  rows: unknown[];
}) {
  const openai = getClient();
  const model =
    process.env.SUMOPOD_MODEL ??
    process.env.DWIPA_MODEL ??
    process.env.OPENAI_MODEL ??
    "gpt-4o-mini";

  const system = [
    "Kamu adalah analis data pabrik.",
    "Jawab dalam Bahasa Indonesia, ringkas tapi jelas.",
    "Jika hasil query kosong, jelaskan bahwa data tidak ditemukan dan sarankan filter yang mungkin.",
    "Jika ada angka target vs actual, sebutkan selisih (actual - target) bila memungkinkan.",
  ].join("\n");

  // Batasi ukuran payload untuk token
  const rowsPreview = JSON.stringify(args.rows).slice(0, 12000);

  const resp = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          `Pertanyaan: ${args.question}`,
          `SQL: ${args.sql}`,
          `Hasil (JSON, mungkin terpotong): ${rowsPreview}`,
          "",
          "Tulis jawaban final untuk user.",
        ].join("\n"),
      },
    ],
  });

  return resp.choices[0]?.message?.content?.trim() ?? "";
}
