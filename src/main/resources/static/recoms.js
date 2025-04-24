const stocks = [
    {
        ticker: "AAPL",
        company: "Apple Inc.",
        change: "+1.2%",
        badge: "🔥 htrend",
    },
    { ticker: "AAZN", company: "Amazonn", change: "-0.8%", badge: "🌱 +5%" },
    {
        ticker: "AMPL",
        company: "Amoo Inc.",
        change: "A 1.2%",
        badge: "🔶 trend",
    },
    { ticker: "TSLA", company: "Papre Inc.", change: "-0.8%", badge: "🪙 +5%" },
    { ticker: "NVDA", company: "Nvidia", change: "+3.0%", badge: "🎯 +5%" },
    { ticker: "GOOG", company: "Google", change: "-0.5%", badge: "🔥 htrend" },
    { ticker: "MSFT", company: "Microsoft", change: "+2.1%", badge: "📈 +4%" },
    { ticker: "GOOG", company: "Google", change: "-0.5%", badge: "🔥 htrend" },
    { ticker: "MSFT", company: "Microsoft", change: "+2.1%", badge: "📈 +4%" },
];

const grid = document.getElementById("stockGrid");
const selectedCount = document.getElementById("selectedCount");
let selected = 0;

stocks.forEach((stock, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <div class="icon-badge-wrapper">
        <div class="badge">${stock.badge}</div>
        <div class="circle-icon"></div>
        </div>
        <div class="stock-name">${stock.ticker}</div>
        <div class="company">${stock.company}</div>
        <div class="card-footer">
        <span>${stock.change} today</span>
        <input type="checkbox" id="check${index}">
      </div>
    `;
    grid.appendChild(card);

    const checkbox = card.querySelector("input");
    checkbox.addEventListener("change", () => {
        card.classList.toggle("selected", checkbox.checked);
        selected += checkbox.checked ? 1 : -1;
        selectedCount.textContent = `Selected: ${selected}`;
    });
});

function darkMode() {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const darkModeState = localStorage.getItem("darkMode");
    if (darkModeState === "enabled") {
        document.body.classList.add("dark-mode");
    }
});
