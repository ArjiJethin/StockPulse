// =====================
// Apply Dark Mode if Enabled
// =====================
document.addEventListener("DOMContentLoaded", () => {
    const darkModeState = localStorage.getItem("darkMode");
    if (darkModeState === "enabled") {
        document.body.classList.add("dark-mode");
    }

    const themeSelect = document.getElementById("theme-select");
    if (themeSelect) {
        themeSelect.value = darkModeState === "enabled" ? "dark" : "light";

        themeSelect.addEventListener("change", () => {
            const selected = themeSelect.value;
            if (selected === "dark") {
                document.body.classList.add("dark-mode");
                localStorage.setItem("darkMode", "enabled");
            } else {
                document.body.classList.remove("dark-mode");
                localStorage.setItem("darkMode", "disabled");
            }
        });
    }
});

// =====================
// Manual Toggle Function (same as other pages)
// =====================
function darkMode() {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }

    const themeSelect = document.getElementById("theme-select");
    if (themeSelect) {
        themeSelect.value = document.body.classList.contains("dark-mode")
            ? "dark"
            : "light";
    }
}

// Helper to draw chart.js styled line chart
function drawChartJS(canvas, data = [], color = "#2a73f5") {
    new Chart(canvas, {
        type: "line",
        data: {
            labels: Array(data.length).fill(""),
            datasets: [
                {
                    data: data,
                    borderColor: color,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: "rgba(42, 115, 245, 0.1)",
                    pointRadius: 0,
                    borderWidth: 2,
                },
            ],
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
            },
            scales: {
                x: {
                    display: false,
                },
                y: {
                    display: false,
                },
            },
        },
    });
}

// Draw main performance chart
const perfCanvas = document.getElementById("performanceChart");
drawChartJS(perfCanvas, randomChartData());

// Dummy data
const portfolioData = [
    { ticker: "AAPL", name: "Apple Inc.", change: +1.2 },
    { ticker: "MSFT", name: "Microsoft Corp.", change: +6.2 },
    { ticker: "GOOGL", name: "Alphabet Inc.", change: -0.2 },
    { ticker: "TSLA", name: "Tesla, Inc.", change: +1.7 },
    { ticker: "NVDA", name: "NVIDIA Corp.", change: -0.99 },
    { ticker: "AMD", name: "AMD", change: -2.11 },
];

const watchlistData = [
    { ticker: "AMZN", name: "Amazon.com", change: +0.7 },
    { ticker: "META", name: "Meta Platforms", change: -1.1 },
    { ticker: "JNJ", name: "Johnson & Johnson", change: +0.2 },
    { ticker: "DIS", name: "Walt Disney", change: -0.4 },
    { ticker: "AMD", name: "AMD", change: +1.9 },
];

// Utility: random array for chart
function randomChartData() {
    return Array.from({ length: 8 }, () => Math.floor(Math.random() * 10) + 1);
}

// Create card
function createStockCard(stock) {
    const card = document.createElement("div");
    card.className = "stock-card";

    const ticker = document.createElement("p");
    ticker.className = "ticker";
    ticker.textContent = stock.ticker;

    const name = document.createElement("p");
    name.textContent = stock.name;

    const canvas = document.createElement("canvas");
    canvas.className = "mini-chart";
    canvas.style.width = "100%";
    canvas.style.height = "40px";

    const change = document.createElement("p");
    change.className = "change";
    change.classList.add(stock.change >= 0 ? "positive" : "negative");
    change.textContent = `${stock.change >= 0 ? "+" : ""}${stock.change}%`;

    card.append(ticker, name, canvas, change);
    drawChartJS(canvas, randomChartData());

    return card;
}

// Render portfolio and watchlist
const portfolioContainer = document.getElementById("portfolio");
portfolioData.forEach((stock) => {
    portfolioContainer.appendChild(createStockCard(stock));
});

const watchlistContainer = document.getElementById("watchlist");
watchlistData.forEach((stock) => {
    watchlistContainer.appendChild(createStockCard(stock));
});

function goHome() {
    window.location.href = "home.html"; // Change this to your actual home page
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}
