# Project Documentation

## 1. Group/Individual Information

Fill in according to the actual team situation. For a 1-person team, there’s no need to fill in multiple member information. (Max 3 members)

Group Name: AzMar

| Team Member | Name |
| --- | --- |
| Team Member 1 | Azuwir Azzurri |
| Team Member 2 | Osmartin Pardomuan Siregar |

## 2. Track

Just pick one

- [ ] Video Generation
- [x] Productivity Enhancement

## 3. Project Information

### Project Title

Structured Data RAG Assistant (NL → SQL → Answer)

### Project Summary

A RAG-style assistant for structured business data. Users ask questions in natural language, the system retrieves the required facts by generating a constrained SQL `SELECT` query over approved tables, executes the query, then produces a grounded, readable answer (intended in Indonesian) based on the returned rows.

### Target Audience

- Operations / plant performance teams who need quick answers from structured monthly metrics
- Analysts who frequently query the same KPI tables and want faster self-service insights
- Internal stakeholders who need summaries without writing SQL

### Problem Being Solved

- Structured KPI data is often stored in relational tables but requires SQL knowledge to explore.
- Repetitive questions (target vs actual, trends, per-plant comparisons) take time to answer manually.
- The project reduces time-to-answer by turning natural-language questions into safe, read-only database retrieval and a concise explanation of the result.

## 4. Project Showcase

### How It Works (RAG for Structured Data)

1. The user asks a question (e.g., production/revenue/LOP by plant, month, year).
2. The system generates a SQL `SELECT` query restricted to known tables/columns.
3. The database executes the query to retrieve the relevant rows (retrieval step).
4. The system summarizes the retrieved rows into a natural-language answer (generation step).

### Key Features

- Grounded answers from live database retrieval (not from model memory)
- Read-only SQL guardrails: `SELECT`-only, no multi-statement, no comments, table allowlist, and enforced `LIMIT`
- Automatic chart dataset generation via a secondary `chart_sql` query when possible
- Simple authentication (credentials) for gated access

### Demo Flow

- Register / log in
- Open the chat interface
- Ask a question in natural language
- Review:
  - The SQL the system executed
  - The returned rows (for transparency)
  - The final summarized answer
  - The optional chart result (if available)

### Example Questions

- “Berapa production actual vs target untuk plant A di bulan 3 tahun 2025?”
- “Total revenue per plant untuk tahun 2024?”
- “Trend LOP revenue per bulan untuk 2 tahun terakhir”

### Documentation Pages

- [User Guide](file:///Users/martinsiregar/Desktop/TRAE/rag_rdbms/documentation/user-guide.md)
- [Developer Guide](file:///Users/martinsiregar/Desktop/TRAE/rag_rdbms/documentation/developer-guide.md)
- [Data Model](file:///Users/martinsiregar/Desktop/TRAE/rag_rdbms/documentation/data-model.md)
