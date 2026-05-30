import OpenAI from "openai";
import { z } from "zod";

const SqlGenSchema = z.object({
  sql: z.string(),
  chart_sql: z.string().optional(),
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
    "1) Output HARUS JSON valid: {\"sql\":\"...\",\"chart_sql\":\"...\",\"note\":\"...\"}. Field chart_sql boleh null/undefined tapi usahakan selalu diisi untuk production/revenue/lop.",
    "2) Semua query HARUS diawali SELECT.",
    "3) Jangan pakai komentar, jangan pakai titik koma (;), jangan DDL/DML.",
    "4) Gunakan nama tabel persis: production, revenue, lop.",
    "5) Jika pertanyaan meminta ringkasan, gunakan agregasi (SUM/AVG) dan GROUP BY seperlunya.",
    "6) Jika user menyebut plant/bulan/tahun, gunakan filter WHERE (plant, month, year).",
    "",
    "ATURAN KHUSUS chart_sql (untuk menampilkan chart otomatis):",
    "- chart_sql harus menghasilkan data time-series / category-series yang mudah di-chart, MINIMAL 2 baris jika memungkinkan.",
    "- Pilih pola berikut (prioritas):",
    "  a) Jika user menyebut month (bulan) DAN year: buat chart per-plant untuk bulan tsb (GROUP BY plant).",
    "  b) Jika user menyebut year (tanpa month): buat chart per-month untuk year tsb (GROUP BY month).",
    "  c) Jika hanya plant disebut (tanpa year): buat chart per-year (GROUP BY year).",
    "  d) Jika tidak ada filter: buat chart per-month untuk 2 tahun terbaru (GROUP BY year, month).",
    "- Untuk PRODUCTION: pilih metrik production_target, production_actual (SUM) dan sertakan kolom dimensi (month/year/plant).",
    "- Untuk REVENUE: metrik revenue_target, revenue_actual (SUM).",
    "- Untuk LOP: metrik lop_hour, lop_production, lop_revenue (SUM).",
    "- Beri alias kolom metrik sesuai nama aslinya (mis. SUM(production_target) AS production_target).",
    "- Tambahkan ORDER BY dimensi (mis. year, month atau plant).",
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
