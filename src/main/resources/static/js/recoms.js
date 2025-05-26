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
    {
        ticker: "GOOGLY",
        company: "Googlay",
        change: "-0.5%",
        badge: "🔥 htrend",
    },
    { ticker: "MSIFT", company: "Misroft", change: "+2.1%", badge: "📈 +4%" },
];

const grid = document.getElementById("stockGrid");
const selectedCount = document.getElementById("selectedCount");
let selected = 0;
const checkboxes = [];

stocks.forEach((stock, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <div class="icon-badge-wrapper">
            <div class="badge">${stock.badge}</div>
                <img src="../assets/Icons/Icon.png" class="stock-icon" alt="${stock.ticker} icon">
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
    checkboxes[index] = checkbox;

    checkbox.addEventListener("change", async () => {
        card.classList.toggle("selected", checkbox.checked);
        selected += checkbox.checked ? 1 : -1;
        selectedCount.textContent = `Selected: ${selected}`;

        const url =
            "/api/user/watchlist" +
            (checkbox.checked ? "" : "/" + stock.ticker);
        const method = checkbox.checked ? "POST" : "DELETE";

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: checkbox.checked ? JSON.stringify(stock.ticker) : null,
            credentials: "include",
        });
    });
});

document.addEventListener("DOMContentLoaded", async () => {
    const darkModeState = localStorage.getItem("darkMode");
    if (darkModeState === "enabled") {
        document.body.classList.add("dark-mode");
    }

    const username = localStorage.getItem("username");
    if (!username) {
        alert("Please log in first.");
        window.location.href = "index.html";
        return;
    }

    // Load saved watchlist
    const res = await fetch("/api/user/watchlist", { credentials: "include" });
    const watchlist = await res.json();

    watchlist.forEach((item) => {
        const stockIndex = stocks.findIndex(
            (s) => s.ticker === item.stockSymbol
        );
        if (stockIndex !== -1) {
            const checkbox = document.getElementById("check" + stockIndex);
            const card = checkbox.closest(".card");
            checkbox.checked = true;
            card.classList.add("selected"); // no event dispatch
        }
    });
});

document
    .getElementById("continueButton")
    .addEventListener("click", async () => {
        const selectedTickers = stocks
            .filter((stock, index) => {
                const checkbox = document.getElementById("check" + index);
                return checkbox && checkbox.checked;
            })
            .map((stock) => stock.ticker);

        for (const ticker of selectedTickers) {
            await fetch("/api/user/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stockSymbol: ticker }),
                credentials: "include",
            });
        }

        window.location.href = "home.html";
    });

function darkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark-mode") ? "enabled" : "disabled"
    );
}
