/** @type {import('tailwindcss').Config} */

import daisyui from "daisyui";

export default {
    content: ["./src/views/*.{pug, html}", "./src/views/**/*.{pug, html}"],
    daisyui: {
        themes: ["light", "dark"],
    },
    plugins: [daisyui],
    darkMode: "class",
};
