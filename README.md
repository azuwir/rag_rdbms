## RAG untuk Data Terstruktur (Next.js + PostgreSQL)

Aplikasi ini melakukan:
1) Terima pertanyaan natural language
2) Generate SQL (SELECT) via LLM (OpenAI-compatible) untuk tabel **production**, **revenue**, **lop**
3) Eksekusi query ke PostgreSQL
4) Rangkum jawaban dalam Bahasa Indonesia

### Struktur tabel

1. **Production**: `id, plant, month, year, production_target, production_actual`
2. **Revenue**: `id, plant, month, year, revenue_target, revenue_actual`
3. **LOP (Loss of Opportunity)**: `id, plant, month, year, lop_hour, lop_production, lop_revenue`

---

## Setup (tanpa Docker)

### 1) Siapkan PostgreSQL

Buat database, misalnya:

```sql
CREATE DATABASE rag_rdbms;
```

### 2) Set environment variables

Copy file contoh env:

```bash
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL`
- `AUTH_SECRET` (untuk session auth)
- `SUMOPOD_API_KEY`
- (opsional) `SUMOPOD_MODEL` (default: `gpt-4o-mini`)
- (opsional) `SUMOPOD_BASE_URL` (default: `https://ai.sumopod.com/v1`)

### 3) Install dependencies

```bash
npm install
```

### 4) Buat tabel via Prisma migrate

```bash
npm run prisma:migrate -- --name init
```

(Opsional) seed:

```bash
npm run prisma:seed
```

### 5) Jalankan aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000`.

---

## Catatan Keamanan

Endpoint `/api/ask` akan mengeksekusi SQL hasil LLM, namun ada validasi dasar (hanya `SELECT`, no `;`, no komentar, hanya 3 tabel yang diizinkan, auto `LIMIT 200`). Untuk produksi, disarankan menambah lapisan keamanan (SQL parser/allowlist yang lebih ketat, atau generate query via parameter terstruktur).
