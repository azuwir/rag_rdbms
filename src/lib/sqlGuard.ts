const DISALLOWED = [
  "insert",
  "update",
  "delete",
  "drop",
  "alter",
  "create",
  "truncate",
  "grant",
  "revoke",
  "comment",
  "call",
  "execute",
  "copy",
];

const ALLOWED_TABLES = new Set(["production", "revenue", "lop"]);

export function normalizeSql(sql: string) {
  return sql.replace(/\s+/g, " ").trim();
}

export function enforceSelectOnly(sql: string) {
  const s = normalizeSql(sql);
  const lower = s.toLowerCase();

  if (!lower.startsWith("select")) {
    throw new Error("SQL ditolak: hanya SELECT yang diizinkan.");
  }

  // Cegah multi-statement / komentar
  if (lower.includes(";") || lower.includes("--") || lower.includes("/*") || lower.includes("*/")) {
    throw new Error("SQL ditolak: statement ganda/komentar tidak diizinkan.");
  }

  for (const kw of DISALLOWED) {
    if (new RegExp(`\\b${kw}\\b`, "i").test(lower)) {
      throw new Error(`SQL ditolak: keyword terlarang terdeteksi (${kw}).`);
    }
  }

  // Pastikan hanya query ke tabel yang diizinkan
  const tableRefs = extractTableRefs(lower);
  if (tableRefs.length === 0) {
    throw new Error("SQL ditolak: tidak menemukan referensi tabel (FROM/JOIN).");
  }
  for (const t of tableRefs) {
    if (!ALLOWED_TABLES.has(t)) {
      throw new Error(`SQL ditolak: tabel tidak diizinkan (${t}).`);
    }
  }

  return s;
}

function extractTableRefs(lowerSql: string) {
  // Ambil table name setelah FROM/JOIN, mendukung schema/table, quoted.
  const refs: string[] = [];
  const regex = /\b(from|join)\s+([a-z0-9_."']+)/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(lowerSql))) {
    const raw = m[2]
      .replace(/["']/g, "")
      .split(".")
      .pop()
      ?.trim();
    if (raw) refs.push(raw);
  }
  return refs;
}

export function ensureLimit(sql: string, max = 200) {
  const s = normalizeSql(sql);
  if (/\blimit\s+\d+\b/i.test(s)) return s;
  return `${s} LIMIT ${max}`;
}

