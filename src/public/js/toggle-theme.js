document.addEventListener("DOMContentLoaded", () => {
    const themeToggleIcon = document.getElementById("theme-toggle");
    const sunIcon = themeToggleIcon.querySelector(".fa-sun");
    const moonIcon = themeToggleIcon.querySelector(".fa-moon");

    themeToggleIcon.addEventListener("click", () => {
        if (document.documentElement.classList.contains("dark"))
            localStorage.setItem("theme", "light");
        else localStorage.setItem("theme", "dark");
        loadTheme(sunIcon, moonIcon);
    });
    loadTheme(sunIcon, moonIcon);
});

function loadTheme(sunIcon, moonIcon) {
    const theme = localStorage.getItem("theme");
    if (theme == "light") {
        document.documentElement.classList.remove("dark");
        sunIcon.classList.remove("hidden");
        moonIcon.classList.add("hidden");
    } else {
        document.documentElement.classList.add("dark");
        sunIcon.classList.add("hidden");
        moonIcon.classList.remove("hidden");
    }
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
}
