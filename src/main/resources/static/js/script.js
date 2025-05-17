const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

registerBtn.addEventListener("click", () => {
    container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
    container.classList.remove("active");
});

// Dark mode handling
const modeBtn = document.querySelector(".mode-btn");

function darkMode() {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }
}

// Form handling logic
document.addEventListener("DOMContentLoaded", () => {
    const darkModeState = localStorage.getItem("darkMode");
    if (darkModeState === "enabled") {
        document.body.classList.add("dark-mode");
    }

    // Mobile splash screen
    const overlay = document.querySelector(".mobile-overlay");
    const isMobile = window.innerWidth <= 650;

    if (overlay && isMobile) {
        setTimeout(() => {
            overlay.classList.add("fade-out");
            setTimeout(() => {
                overlay.style.display = "none";
            }, 1000);
        }, 4000);
    }

    // Register handler
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("register-username").value;
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;

            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const text = await res.text();
            alert(text);
            if (res.ok) window.location.href = "index.html";
        });
    }

    // Login handler
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("login-username").value;
            const password = document.getElementById("login-password").value;

            // 🔽 REPLACE this entire fetch block with the fixed version
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const result = await res.json(); // ✅ only parse once

            if (res.ok) {
                localStorage.setItem("sp_current_user", JSON.stringify(result));
                localStorage.setItem("username", result.username);
                alert("Login successful");
                window.location.href = "recoms.html"; // ✅ should now work
            } else {
                alert(result.message || "Login failed"); // handle backend error message
            }
        });
    }
});
