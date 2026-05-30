# User Guide

## What You Can Ask

The assistant is designed for structured questions over three datasets:

- production: target vs actual production
- revenue: target vs actual revenue
- lop (Loss of Opportunity): hour / production / revenue losses

Common question patterns:

- Target vs actual comparison for a plant, month, and year
- Yearly or monthly trends
- Per-plant ranking for a given period
- Aggregated totals (SUM/AVG) and grouped breakdowns

## How Answers Are Produced

Answers are grounded in database retrieval:

1. Your question is converted into a SQL `SELECT` query against allowed tables.
2. The query is executed to retrieve rows.
3. The assistant generates a summary based on those rows.

## Tips for Better Results

- Mention at least one of: plant, month, year.
- If asking for a trend, specify the time window (e.g., “tahun 2024”, “2 tahun terakhir”).
- Use “target” and “actual” keywords when you want comparisons.

## Understanding the Response

Responses typically include:

- SQL: the executed (guarded) query
- rows: the retrieved result set (up to a limit)
- answer: the summarized explanation (intended in Indonesian)
- chartSql / chartRows: optional chart-friendly dataset

## Example Questions

- “Total production_actual dan production_target per plant untuk bulan 5 tahun 2025.”
- “Revenue actual vs target per bulan untuk tahun 2024.”
- “LOP revenue tertinggi per plant untuk tahun 2023.”
