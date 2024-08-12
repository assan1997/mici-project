import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        raleway: ["var(--font-raleway)"],
        montserat: ["var(--font-montserat)"],
        poppins: ["var(--font-poppins)"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        custom: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", // X, Y, Blur, Spread, Color
        custom_2: "0px 1px 3px 0px #0000001A,  0px -1px 0px 0px #BF1A16 inset",
        custom_3: "0px 1px 3px 0px #0B132412, 0px -1px 0px 0px #00000039 inset",
        custom_4: "0px 0px 1px 0px #00000059, 0px 0px 1px 0px #00000014",
        sm: "0px 1px 2px 0px #1018280F, 0px 1px 3px 0px #1018281A",
        large: "0px 3px 20px 0px #0000001c",

        // ----OLD-----
        xs: "box-shadow: 0px 1px 2px 0px #1018280D",
        small: "box-shadow: 0px 2px 4px 0px #1B1C1D0A",
        // large: "0px 4px 6px -2px #10182808 0px 12px 16px -4px #10182814",
        "card-md":
          "box-shadow: 0px 0px 1px 0px #00000040 box-shadow: 0px 2px 1px 0px #0000000D",
        emoji:
          "box-shadow: 0px 2px 10px 0px #7809161A box-shadow: 0px 0px 2px 0px #78091633",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
export default config;
