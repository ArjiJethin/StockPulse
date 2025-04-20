const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

registerBtn.addEventListener("click", () => {
    container.classList.add("active"); // Use "active" instead of "activate"
});

loginBtn.addEventListener("click", () => {
    container.classList.remove("active"); // Remove "active" to switch back to login
});
