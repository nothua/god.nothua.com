document.addEventListener("DOMContentLoaded", () => {
      const themeToggleIcon = document.getElementById("theme-toggle");
      const sunIcon = themeToggleIcon.querySelector(".fa-sun");
      const moonIcon = themeToggleIcon.querySelector(".fa-moon");

      // Check if dark mode is set in localStorage
      if (localStorage.getItem("theme") !== "dark") {
            document.documentElement.classList.remove("dark");
      }

      themeToggleIcon.addEventListener("click", () => {
            if (document.documentElement.classList.contains("dark")) {
                  document.documentElement.classList.remove("dark");
                  localStorage.setItem("theme", "light");
                  sunIcon.classList.remove("hidden");
                  moonIcon.classList.add("hidden");
            } else {
                  document.documentElement.classList.add("dark");
                  localStorage.setItem("theme", "dark");
                  sunIcon.classList.add("hidden");
                  moonIcon.classList.remove("hidden");
            }
      });
});
