"use client";

import { useMemo, useState } from "react";
import AutoChart from "./auto-chart";

type AskResponse =
  | {
      ok: true;
      question: string;
      sql: string;
      chartSql?: string | null;
      note: string | null;
      rows: unknown[];
      chartRows?: unknown[] | null;
      answer: string;
    }
  | { ok: false; error: string };

const EXAMPLES = [
  "Berapa total produksi actual vs target untuk Plant A tahun 2026?",
  "Tampilkan revenue actual per bulan untuk Plant B tahun 2025.",
  "Berapa total LOP revenue dan LOP hour untuk Plant A pada Maret 2026?",
  "Plant mana yang paling besar gap revenue (actual - target) untuk tahun 2025?",
];

export default function RagChat() {
  const [question, setQuestion] = useState(EXAMPLES[0]);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<AskResponse | null>(null);

  const canSubmit = useMemo(() => question.trim().length >= 3 && !loading, [question, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setResp(null);

    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const json = (await r.json()) as AskResponse;
      setResp(json);
    } catch (err) {
      setResp({ ok: false, error: err instanceof Error ? err.message : "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-white/80 font-medium">Pertanyaan</label>
            <div className="text-xs text-white/50">Contoh: tanya target vs actual, per plant/bulan/tahun</div>
          </div>

          <textarea
            className="w-full rounded-2xl bg-white/10 border border-white/15 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400/60 text-sm leading-6"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Contoh: Berapa total revenue actual Plant A tahun 2026?"
          />

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setQuestion(ex)}
                className="text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={!canSubmit}
          >
            {loading ? "Memproses..." : "Tanya"}
          </button>
          <button
            className="rounded-xl bg-white/10 border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed"
            type="button"
            onClick={() => setQuestion(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)])}
            disabled={loading}
          >
            Contoh acak
          </button>
        </div>
      </form>

      {resp?.ok === false ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
          <b>Error:</b> {resp.error}
        </div>
      ) : null}

      {resp?.ok === true ? (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-semibold">Jawaban</h2>
            <span className="text-xs text-white/50">Rows: {resp.rows?.length ?? 0}</span>
          </div>
          <div className="mt-2 whitespace-pre-wrap leading-6 text-sm">{resp.answer || "(Tidak ada jawaban dari model)"}</div>

          <AutoChart rows={resp.chartRows && resp.chartRows.length > 1 ? resp.chartRows : resp.rows} />

          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-white/70 hover:text-white">
              Debug (SQL & data)
            </summary>
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-xs text-white/60 mb-1">SQL</div>
                <pre className="text-xs overflow-auto rounded-xl bg-black/20 border border-white/10 p-3">
                  {resp.sql}
                </pre>
              </div>
              {resp.chartSql ? (
                <div>
                  <div className="text-xs text-white/60 mb-1">Chart SQL</div>
                  <pre className="text-xs overflow-auto rounded-xl bg-black/20 border border-white/10 p-3">
                    {resp.chartSql}
                  </pre>
                </div>
              ) : null}
              <div>
                <div className="text-xs text-white/60 mb-1">Rows</div>
                <pre className="text-xs overflow-auto rounded-xl bg-black/20 border border-white/10 p-3">
                  {JSON.stringify(resp.rows, null, 2)}
                </pre>
              </div>
              {resp.chartRows ? (
                <div>
                  <div className="text-xs text-white/60 mb-1">Chart Rows</div>
                  <pre className="text-xs overflow-auto rounded-xl bg-black/20 border border-white/10 p-3">
                    {JSON.stringify(resp.chartRows, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          </details>
        </div>
      ) : null}
    </div>
  );
}
