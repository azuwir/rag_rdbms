"use client";

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";
import { useMemo, useState } from "react";

type Row = Record<string, unknown>;

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function isProbablyMonthKey(key: string) {
  const k = key.toLowerCase();
  return k === "month" || k.includes("bulan");
}

function isProbablyYearKey(key: string) {
  const k = key.toLowerCase();
  return k === "year" || k.includes("tahun");
}

function isProbablyPlantKey(key: string) {
  const k = key.toLowerCase();
  return k === "plant" || k.includes("pabrik");
}

function pickXKey(rows: Row[]): string | null {
  const keys = Object.keys(rows[0] ?? {});
  const preferred = ["month", "bulan", "year", "tahun", "plant", "pabrik", "date", "tanggal"];
  for (const p of preferred) {
    const found = keys.find((k) => k.toLowerCase() === p);
    if (found) return found;
  }

  // fallback: pertama yang bukan numeric
  for (const k of keys) {
    const sample = rows[0]?.[k];
    if (toNumber(sample) === null) return k;
  }
  return null;
}

function pickYearKey(rows: Row[]): string | null {
  const keys = Object.keys(rows[0] ?? {});
  const yearKey = keys.find((k) => isProbablyYearKey(k));
  if (!yearKey) return null;

  // Pastikan memang numeric
  let ok = 0;
  let total = 0;
  for (const r of rows.slice(0, 20)) {
    total++;
    if (toNumber(r[yearKey]) !== null) ok++;
  }
  if (total > 0 && ok / total >= 0.7) return yearKey;
  return null;
}

function pickYKeys(rows: Row[], xKey: string): string[] {
  // Exclude kolom yang bukan metrik (mis. id/year) agar tidak tampil sebagai legend/series
  const keys = Object.keys(rows[0] ?? {}).filter(
    (k) => k !== xKey && k.toLowerCase() !== "id" && !isProbablyYearKey(k)
  );
  const numericKeys = keys.filter((k) => {
    // numeric kalau mayoritas baris bisa di-parse number
    let ok = 0;
    let total = 0;
    for (const r of rows.slice(0, 20)) {
      total++;
      if (toNumber(r[k]) !== null) ok++;
    }
    return total > 0 && ok / total >= 0.7;
  });

  // Prioritaskan actual/target kalau ada
  const score = (k: string) => {
    const s = k.toLowerCase();
    if (s.includes("actual")) return 3;
    if (s.includes("target")) return 2;
    if (s.includes("sum") || s.includes("total")) return 1;
    return 0;
  };

  return numericKeys.sort((a, b) => score(b) - score(a)).slice(0, 3);
}

function normalize(rows: Row[], xKey: string, yKeys: string[]) {
  return rows.map((r) => {
    const out: Record<string, unknown> = {};
    out[xKey] = r[xKey] as unknown;
    for (const y of yKeys) out[y] = toNumber(r[y]);
    return out;
  });
}

export default function AutoChart({ rows }: { rows: unknown[] }) {
  const [mode, setMode] = useState<"auto" | "line" | "bar">("auto");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const prepared = useMemo(() => {
    if (!Array.isArray(rows) || rows.length < 2) {
      return { ok: false as const, reason: "Data tidak cukup untuk chart (minimal 2 baris)." };
    }
    const first = rows[0];
    if (!first || typeof first !== "object") {
      return { ok: false as const, reason: "Format rows tidak valid untuk chart." };
    }

    const dataRows = rows as Row[];
    const xKey = pickXKey(dataRows);
    if (!xKey) return { ok: false as const, reason: "Tidak menemukan kolom X yang cocok." };

    const yKeys = pickYKeys(dataRows, xKey);
    if (yKeys.length === 0)
      return { ok: false as const, reason: "Tidak menemukan kolom angka (Y) untuk chart." };

    const yearKey = pickYearKey(dataRows);
    const years =
      yearKey === null
        ? []
        : Array.from(
            new Set(
              dataRows
                .map((r) => toNumber(r[yearKey]))
                .filter((v): v is number => typeof v === "number")
            )
          ).sort((a, b) => a - b);

    const xLooksTime = isProbablyMonthKey(xKey) || isProbablyYearKey(xKey);
    const xLooksCategory = isProbablyPlantKey(xKey);
    const autoUseLine = xLooksTime && !xLooksCategory;

    return { ok: true as const, xKey, yKeys, dataRows, yearKey, years, autoUseLine };
  }, [rows]);

  if (!prepared.ok) return null;

  const dataForChart = useMemo(() => {
    const { dataRows, xKey, yKeys, yearKey } = prepared;
    if (yearFilter === "all" || !yearKey) return normalize(dataRows, xKey, yKeys);

    const yf = Number(yearFilter);
    const filtered = dataRows.filter((r) => toNumber(r[yearKey]) === yf);
    return normalize(filtered, xKey, yKeys);
  }, [prepared, yearFilter]);

  const useLine = mode === "auto" ? prepared.autoUseLine : mode === "line";

  const colors = ["#a78bfa", "#34d399", "#f472b6"]; // ungu, hijau, pink

  const showYearFilter =
    prepared.yearKey &&
    prepared.xKey !== prepared.yearKey &&
    Array.isArray(prepared.years) &&
    prepared.years.length >= 2;

  return (
    <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Chart</div>
          <div className="text-xs text-white/60">
            Dari hasil query ({prepared.xKey} vs {prepared.yKeys.join(", ")})
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showYearFilter ? (
            <>
              <div className="text-xs text-white/60">Tahun</div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="text-sm rounded-xl bg-white/10 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300/50"
              >
                <option value="all">Semua</option>
                {prepared.years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </>
          ) : null}

          <div className="text-xs text-white/60">Chart</div>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "auto" | "line" | "bar")}
            className="text-sm rounded-xl bg-white/10 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400/60"
          >
            <option value="auto">Auto</option>
            <option value="line">Line</option>
            <option value="bar">Bar</option>
          </select>
        </div>
      </div>

      <div className="mt-3 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          {useLine ? (
            <LineChart data={dataForChart}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey={prepared.xKey} stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  background: "rgba(12,18,32,0.85)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                }}
              />
              <Legend />
              {prepared.yKeys.map((k, i) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={colors[i % colors.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={dataForChart}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey={prepared.xKey} stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  background: "rgba(12,18,32,0.85)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                }}
              />
              <Legend />
              {prepared.yKeys.map((k, i) => (
                <Bar
                  key={k}
                  dataKey={k}
                  fill={colors[i % colors.length]}
                  radius={[10, 10, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
