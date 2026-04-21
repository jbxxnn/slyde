import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17201a",
        moss: "#315746",
        leaf: "#5f8d6a",
        amber: "#d6a642",
        clay: "#c66f55",
        paper: "#fbfaf5",
        mist: "#eef3ef",
      },
      boxShadow: {
        soft: "0 16px 50px rgba(23, 32, 26, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
