const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      lineClamp: {
        8: "8",
      },
      fontFamily: {
        sans: ["Poppins", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // theme: "#11041c",
        theme: "#151728",
        darktheme: "#151728",
        // darktheme: "#0E0119",
        white: "#FBFAF5",
        spacer: "#19062D",
        graything: "#2D2F3E",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/line-clamp"), require("tailwind-scrollbar-hide")],
};
