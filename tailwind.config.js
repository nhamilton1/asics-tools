/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        Roboto: ["Roboto", "serif"],
      },
      animation: {
        marquee: "marquee 60s linear infinite",
        marquee2: "marquee2 60s linear infinite",
        transitionUp: "transitionUp 1s linear forwards",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        marquee2: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        transitionUp: {
          "0%": { transform: "translateY(0%)" },
          "99%": {
            transform: "translateY(-99%)",
          },
          "100%": {
            transform: "translateY(-100%)",
            display: "none",
            marginBottom: "-3rem",
          },
        },
      },
    },
  },
  plugins: [],
};
