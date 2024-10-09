/** @type {import('tailwindcss').Config} */
export default {
      content: ["./src/views/*.{pug, html}", "./src/views/**/*.{pug, html}"],
      theme: {},
      plugins: [require("daisyui")],
      darkMode: "class",
};
