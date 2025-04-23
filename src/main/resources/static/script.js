const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

registerBtn.addEventListener("click", () => {
    container.classList.add("active"); // Use "active" instead of "activate"
});

loginBtn.addEventListener("click", () => {
    container.classList.remove("active"); // Remove "active" to switch back to login
});

// Check localStorage and apply dark mode on page load
const modeBtn = document.querySelector(".mode-btn");

document.addEventListener("DOMContentLoaded", () => {
    const darkModeState = localStorage.getItem("darkMode");
    if (darkModeState === "enabled") {
        document.body.classList.add("dark-mode");
    }
});

function darkMode() {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const overlay = document.querySelector(".mobile-overlay");
    const isMobile = window.innerWidth <= 650;

    if (overlay && isMobile) {
        // Match SVG animation duration (7s) + delay (optional)
        setTimeout(() => {
            overlay.classList.add("fade-out");

            // Fully remove after fade transition ends
            setTimeout(() => {
                overlay.style.display = "none";
            }, 1000); // match fade duration
        }, 4000); // match animation loop length
    }
});
