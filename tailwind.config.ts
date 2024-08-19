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
      colors: {
        // NEW COLORS ----------
        "primary-black-leg": {
          50: "#F6F6F6",
          100: "#E7E7E7",
          200: "#D1D1D1",
          300: "#B0B0B0",
          400: "#888888",
          500: "#6D6D6D",
          600: "#5D5D5D",
          700: "#4F4F4F",
          900: "#3D3D3D",
          950: "#000000",
        },

        "secondary-super-pink": {
          600: "#068FFF",
          900: "#0D519B",
          950: "#0E315D",
        },

        "secondary-sunny-gold": {
          50: "#FFF8EB",
        },

        "secondary-Jasmine": {
          50: "#FFF8EB",
        },

        "primary-shanks-red": {
          500: "#F6423D",
          600: "#E2211C",
        },

        "neutral-grayscale": {
          200: "#E6E6E6",
        },

        // OLD ----------------
        "default-textcolor": "#1D1C20",
        // "primary-100": "#000",
        // "primary-200": "#111",

        "lavender-mist": "#E9E6F7",
        champagne: "#FDEFEA",
        periwinkle: "#D4E2F3",
        grey: "#F7F7F7",
        "hero-one": "#FEF8EF",
        "hero-two": "#EBF6FD",

        grayscale: {
          10: "#F8F8F9",
          25: "#F4F4F5",
          50: "#F1F1F1",
          100: "#ECECED",
          200: "#E6E6E6",
          300: "#DCDCDE",
          400: "#C9C9Cc",
          500: "#ADACB0",
          600: "#A3A2A6",
          700: "#4F4D55",
          800: "#2D2B32",
          900: "#1D1C20",
        },

        "majorelle-blue": {
          50: "#F0EAFE",
          100: "#E4DCFE",
          200: "#C8BAFD",
          300: "#A997F9",
          400: "#907BF3",
          500: "#6951EC",
          600: "#4F3BCA",
          700: "#3828A9",
          800: "#251988",
          900: "#180F71",
        },

        "powder-pink": {
          25: "#FEEBEE",
          50: "#FCDFE8",
          100: "#F6C8DF",
          200: "#ED94C9",
          300: "#CA58A6",
          400: "#962C7E",
          500: "#510547",
          600: "#450343",
          700: "#37023A",
          800: "#28012E",
          900: "#1D0026",
        },
        "cobalt-blue": {
          50: "#E5F4FD",
          100: "#D2E7FA",
          200: "#A6CDF6",
          300: "#75A7E5",
          400: "#4F82CB",
          500: "#2053A9",
          600: "#174091",
          700: "#102F79",
          800: "#0A2062",
          900: "#061651",
        },
        "super-pink": {
          50: "#FEEFF0",
          100: "#FCE4EA",
          200: "#FACADB",
          300: "#F0ABCB",
          400: "#E190BE",
          500: "#CE6BAD",
          600: "#B14E99",
          700: "#943587",
          800: "#772274",
          900: "#5E1462",
        },

        "sea-green": {
          50: "#F3FEF0",
          100: "#E8FDE6",
          200: "#CEFCCF",
          300: "#B4F7BC",
          400: "#9EF0B0",
          500: "#7EE79F",
          600: "#5CC688",
          700: "#3FA673",
          800: "#288561",
          900: "##186E55",
        },

        information: {
          50: "#DFFDFA",
          100: "#CCFEFB",
          200: "#9AFCFE",
          300: "#67EFFD",
          400: "#41DDFB",
          500: "#41DDFB",
          600: "#0295D6",
          700: "#0270B3",
          800: "#015090",
          900: "#003977",
        },

        diamond: {
          50: "#DFFDFA",
          300: "#5AC8E2",
          700: "#5B8BB4",
        },

        jasmine: {
          50: "#FFFDEF",
          100: "#FFFBE5",
          200: "#FFF5CB",
          300: "#FFEEB1",
          400: "#FFE89E",
          500: "#FFDD7E",
          600: "#DBB65C",
          700: "#B7913F",
          800: "#936E28",
          900: "#7A5518",
        },

        warning: {
          50: "#FEFAE0",
          100: "#FDF5CB",
          200: "#FCE897",
          300: "#F8D663",
          400: "#F1C33C",
          500: "#E8A600",
          600: "#C78800",
          700: "#A76D00",
          800: "#865400",
          900: "#6F4200",
        },

        danger: {
          50: "#FDF0E3",
          100: "#FDDCCA",
          200: "#FBB096",
          300: "#F47B61",
          400: "#E9493A",
          500: "#DB0000",
          600: "#BC0010",
          700: "#9D001B",
          800: "#7F0021",
          900: "#690024",
        },

        success: {
          50: "#EDFCE5",
          100: "#DAF8D1",
          200: "#B1F1A5",
          300: "#77D671",
          400: "#47AD4B",
          500: "#1A7726",
          600: "#136625",
          700: "#0D5523",
          800: "#084520",
          900: "#04391F",
        },

        pgreen: {
          50: "#F3FEF0",
          100: "#E8FDE6",
          200: "#CEFCCF",
          300: "#B4F7BC",
          400: "#9EF0B0",
          500: "#7EE79F",
          600: "#5CC688",
          700: "#3FA673",
          800: "#288561",
          900: "#186E55",
        },

        info: {
          50: "#DFFDFA",
          100: "#C8F7FA",
          200: "#93E9F5",
          300: "#5AC8E2",
          400: "#31A0C5",
          500: "#006DAO",
          600: "#005489",
          700: "#003F73",
          800: "#002D5C",
          900: "#00204C",
        },

        vermilion: {
          10: "#FEFCF6",
          25: "#FEF9EE",
          50: "#FEF5E6",
          100: "#FEEAD6",
          200: "#FECFAD",
          300: "#FEAD84",
          400: "#FD8D65",
          500: "#FC5933",
          600: "#D83925",
          700: "#B51F19",
          800: "#921014",
          900: "#780916",
        },

        hex: {
          50: "#2053A9",
        },

        c1: "#694AF0",
        c2: "#F3F2F8",
        c3: "#D5FBD9",
        c4: "#792C2E",
        c5: "#51498F",
        c6: "#2BB170",
        c7: "#EFF0FF",
        c8: "#F7F7F7",
        c9: "#EFEFEF",
        c10: "#FCDFE880",
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
