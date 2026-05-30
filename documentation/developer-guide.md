# Developer Guide

## Overview

The core flow is implemented as:

- SQL generation: prompt-constrained JSON output containing `sql` and optional `chart_sql`
- SQL safety enforcement: `SELECT`-only + guardrails + auto `LIMIT`
- Query execution: runs against PostgreSQL and returns raw rows
- Answer generation: summarizes the returned rows into a concise response

## Environment Variables

Create `.env` from `.env.example` and set:

- DATABASE_URL
- AUTH_SECRET
- SUMOPOD_API_KEY
- SUMOPOD_MODEL (optional)
- SUMOPOD_BASE_URL (optional)

The LLM client is OpenAI-compatible and supports fallback keys:

- SUMOPOD_* → DWIPA_* → OPENAI_*

## Database Setup

- Run Prisma migrations to create tables.
- Optionally seed example data for local testing.

The schema includes:

- production, revenue, lop (KPI tables)
- users (for credentials auth)

## API: POST /api/ask

Request body:

```json
{ "question": "string" }
```

Response body (success):

```json
{
  "ok": true,
  "question": "string",
  "sql": "string",
  "chartSql": "string | null",
  "note": "string | null",
  "rows": [],
  "chartRows": [],
  "answer": "string"
}
```

Response body (error):

```json
{ "ok": false, "error": "string" }
```

## SQL Guardrails

The system enforces:

- Must start with SELECT
- No semicolons and no SQL comments
- Rejects DDL/DML keywords (insert/update/delete/drop/etc.)
- Only allows table references to: production, revenue, lop
- Adds LIMIT 200 if no limit is present

## Auth

Credentials-based authentication validates email/password against `users.password_hash`.

## Code References

- [route.ts](file:///Users/martinsiregar/Desktop/TRAE/rag_rdbms/src/app/api/ask/route.ts)
- [rag.ts](file:///Users/martinsiregar/Desktop/TRAE/rag_rdbms/src/lib/rag.ts)
- [sqlGuard.ts](file:///Users/martinsiregar/Desktop/TRAE/rag_rdbms/src/lib/sqlGuard.ts)
- [schema.prisma](file:///Users/martinsiregar/Desktop/TRAE/rag_rdbms/prisma/schema.prisma)
