import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        glass: "0 10px 30px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
} satisfies Config;

