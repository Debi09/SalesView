import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F8F4E8",
        ink: "#121212",
        nb: {
          yellow: "#FFE500",
          blue: "#4263FF",
          pink: "#FF5CA8",
          lime: "#B9F227",
          orange: "#FF7A00",
        },
      },
      boxShadow: {
        nb: "5px 5px 0px #121212",
        "nb-lg": "8px 8px 0px #121212",
        "nb-sm": "3px 3px 0px #121212",
      },
      fontFamily: {
        sans: ["var(--font-archivo)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
