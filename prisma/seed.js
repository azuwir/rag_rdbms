/**
 * Seeder untuk 3 tabel: production, revenue, lop (tahun 2025 & 2026)
 *
 * Jalankan:
 *   npm run prisma:seed
 *
 * Catatan:
 * - Seeder ini akan MENGHAPUS data existing untuk tahun 2025 & 2026 agar aman dijalankan berulang.
 * - Angka dibuat deterministik (berbasis formula) agar hasil konsisten.
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const PLANTS = ["Plant A", "Plant B", "Plant C"];
const YEARS = [2025, 2026];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function round2(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Buat pseudo-random kecil tapi deterministik berdasarkan (plant, year, month, salt)
 */
function jitter(plantIdx, year, month, salt = 0) {
  // Linear congruential-ish, output ~ [-1, 1]
  const x = (plantIdx + 1) * 100000 + year * 100 + month * 10 + salt;
  const v = Math.sin(x) * 10000;
  return (v - Math.floor(v)) * 2 - 1;
}

function makeProduction(plant, plantIdx, year, month) {
  // Target naik sedikit di 2026, plus seasonality.
  const base = 1000 + plantIdx * 120;
  const season = 1 + 0.08 * Math.sin((month / 12) * Math.PI * 2);
  const yearFactor = year === 2026 ? 1.06 : 1.0;
  const target = base * season * yearFactor;

  // Actual sekitar target +/- 10%
  const dev = jitter(plantIdx, year, month, 1) * 0.1;
  const actual = target * (1 + dev);

  return {
    plant,
    year,
    month,
    productionTarget: round2(target),
    productionActual: round2(actual),
  };
}

function makeRevenue(plant, plantIdx, year, month, productionRow) {
  // Revenue target sebanding dengan produksi target, dikali harga rata-rata.
  const price = 1800 + plantIdx * 150; // asumsi harga/unit
  const target = Number(productionRow.productionTarget) * price;

  // Actual mengikuti produksi actual dengan variasi kecil price mix +/- 3%
  const priceMix = 1 + jitter(plantIdx, year, month, 2) * 0.03;
  const actual = Number(productionRow.productionActual) * price * priceMix;

  return {
    plant,
    year,
    month,
    revenueTarget: round2(target),
    revenueActual: round2(actual),
  };
}

function makeLop(plant, plantIdx, year, month, productionRow, revenueRow) {
  // LOP hour makin tinggi saat deviasi produksi negatif (shortfall).
  const gapProd = Number(productionRow.productionActual) - Number(productionRow.productionTarget);
  const shortfall = Math.max(0, -gapProd);

  const lopHour = clamp(10 + shortfall * 0.06 + (jitter(plantIdx, year, month, 3) * 6), 0, 160);
  const lopProduction = clamp(shortfall * (0.7 + Math.abs(jitter(plantIdx, year, month, 4)) * 0.3), 0, 9999);

  // LOP revenue ~ lost production * price proxy
  const priceProxy =
    Number(revenueRow.revenueTarget) / Math.max(1, Number(productionRow.productionTarget));
  const lopRevenue = lopProduction * priceProxy;

  return {
    plant,
    year,
    month,
    lopHour: round2(lopHour),
    lopProduction: round2(lopProduction),
    lopRevenue: round2(lopRevenue),
  };
}

async function main() {
  const fromYear = Math.min(...YEARS);
  const toYear = Math.max(...YEARS);

  console.log(`Seeding data untuk tahun ${fromYear}-${toYear}...`);

  // Seed 2 users (idempotent via upsert)
  console.log("Seeding users (2 akun)...");
  const users = [
    { name: "Admin", email: "admin@demo.local", password: "Admin123!" },
    { name: "Analyst", email: "analyst@demo.local", password: "Analyst123!" },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, passwordHash },
      create: { name: u.name, email: u.email, passwordHash },
    });
  }

  // Bersihkan data existing pada rentang tahun target (idempotent-ish)
  await prisma.lop.deleteMany({ where: { year: { in: YEARS } } });
  await prisma.revenue.deleteMany({ where: { year: { in: YEARS } } });
  await prisma.production.deleteMany({ where: { year: { in: YEARS } } });

  const productionRows = [];
  const revenueRows = [];
  const lopRows = [];

  for (const year of YEARS) {
    for (const month of MONTHS) {
      for (let i = 0; i < PLANTS.length; i++) {
        const plant = PLANTS[i];
        const p = makeProduction(plant, i, year, month);
        const r = makeRevenue(plant, i, year, month, p);
        const l = makeLop(plant, i, year, month, p, r);

        productionRows.push(p);
        revenueRows.push(r);
        lopRows.push(l);
      }
    }
  }

  // Insert batch
  await prisma.production.createMany({ data: productionRows });
  await prisma.revenue.createMany({ data: revenueRows });
  await prisma.lop.createMany({ data: lopRows });

  console.log(
    `Selesai. Inserted: production=${productionRows.length}, revenue=${revenueRows.length}, lop=${lopRows.length}`
  );
  console.log("Users seeded: admin@demo.local / Admin123!, analyst@demo.local / Analyst123!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
