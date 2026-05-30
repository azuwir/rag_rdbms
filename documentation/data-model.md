# Data Model

## production

Tracks production KPIs per plant and time period.

- id: integer
- plant: string
- month: integer (1-12)
- year: integer
- production_target: decimal
- production_actual: decimal

## revenue

Tracks revenue KPIs per plant and time period.

- id: integer
- plant: string
- month: integer (1-12)
- year: integer
- revenue_target: decimal
- revenue_actual: decimal

## lop (Loss of Opportunity)

Tracks loss metrics per plant and time period.

- id: integer
- plant: string
- month: integer (1-12)
- year: integer
- lop_hour: decimal
- lop_production: decimal
- lop_revenue: decimal

## users

Application users for credentials login.

- id: string (cuid)
- name: string (optional)
- email: string (unique)
- password_hash: string
- created_at: datetime
- updated_at: datetime

Source: [schema.prisma](file:///Users/martinsiregar/Desktop/TRAE/rag_rdbms/prisma/schema.prisma)
