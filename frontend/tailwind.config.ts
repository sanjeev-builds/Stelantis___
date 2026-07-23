import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F62FE",
          dark: "#0043CE",
        },
      },
    },
  },
  plugins: [],
};

export default config;
