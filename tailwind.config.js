/** @type {import('tailwindcss').Config} */
export default {
      content: ["./src/views/*.{pug, html}", "./src/views/**/*.{pug, html}"],
      theme: {
            extend: {
                  fontFamily: {
                        cinzel: ["Cinzel", "serif"],
                        poppins: ["Poppins", "sans-serif"],
                  },
            },
      },
      plugins: [],
      darkMode: "class",
};
