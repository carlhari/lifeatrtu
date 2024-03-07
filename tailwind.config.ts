import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      "2xl": { max: "1535px" },
      // => @media (max-width: 1535px) { ... }

      xl: { max: "1279px" },
      // => @media (max-width: 1279px) { ... }

      lg: { max: "1023px" },
      // => @media (max-width: 1023px) { ... }

      md: { max: "767px" },
      // => @media (max-width: 767px) { ... }

      sm: { max: "639px" },
      // => @media (max-width: 639px) { ... }

      xs: { max: "480px" },

      xxs: { max: "400px" },
    },

    extend: {
      fontSize: {
        "250": "250px",
        "p-85": "99px",
      },

      height: {
        "p-90": "89.5%",
      },
      maxHeight: {
        "p-88": "88%",
        "p-95": "98%",
        "p-290": "290px",
        "p-250": "250px",
        "p-200": "200px",
        "p-130": "130px",
      },
      width: {
        "p-88": "88%",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },

      animation: {
        fadeIn: `fadeIn .5s linear`,
        fadeOut: "fadeOut .5s linear",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"],
  },
};
export default config;
