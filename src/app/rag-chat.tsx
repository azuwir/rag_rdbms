"use client";

import { useMemo, useState } from "react";
import styles from "./rag-chat.module.css";

type AskResponse =
  | { ok: true; question: string; sql: string; note: string | null; rows: unknown[]; answer: string }
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
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label}>
          Pertanyaan
          <textarea
            className={styles.textarea}
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Contoh: Berapa total revenue actual Plant A tahun 2026?"
          />
        </label>

        <div className={styles.actions}>
          <button className={styles.primary} type="submit" disabled={!canSubmit}>
            {loading ? "Memproses..." : "Tanya"}
          </button>
          <button
            className={styles.secondary}
            type="button"
            onClick={() => setQuestion(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)])}
            disabled={loading}
          >
            Contoh acak
          </button>
        </div>
      </form>

      {resp?.ok === false ? (
        <div className={styles.error}>
          <b>Error:</b> {resp.error}
        </div>
      ) : null}

      {resp?.ok === true ? (
        <div className={styles.result}>
          <h2>Jawaban</h2>
          <div className={styles.answer}>{resp.answer || "(Tidak ada jawaban dari model)"}</div>

          <details className={styles.details}>
            <summary>Debug (SQL & data)</summary>
            <div className={styles.kv}>
              <div className={styles.k}>SQL</div>
              <pre className={styles.pre}>{resp.sql}</pre>
            </div>
            <div className={styles.kv}>
              <div className={styles.k}>Rows</div>
              <pre className={styles.pre}>{JSON.stringify(resp.rows, null, 2)}</pre>
            </div>
          </details>
        </div>
      ) : null}
    </div>
  );
}

