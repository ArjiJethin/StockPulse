// =====================
// Globals
// =====================
let mainChartData;
const chartInstances = [];
const chartMap = new Map();

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
            redrawAllCharts();
        });
    }

    const username = localStorage.getItem("username");
    if (!username) {
        alert("Please log in first.");
        window.location.href = "index.html";
        return;
    }

    // user.js (snippet inside DOMContentLoaded)
    const user = JSON.parse(localStorage.getItem("sp_current_user") || "{}");

    if (user.username) {
        document.querySelector(".user h3").textContent = user.username;
        const avatarImg = document.querySelector(".user img.avatar");
        if (avatarImg && user.username) {
            const seed = encodeURIComponent(user.username);
            const timestamp = Date.now(); // optional cache buster

            // Dicebear styles for futuristic/cool avatars:
            const dicebearStyles = {
                bottts: `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&t=${timestamp}`,
                pixelArtNeutral: `https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=${seed}&t=${timestamp}`,
                micah: `https://api.dicebear.com/7.x/micah/svg?seed=${seed}&t=${timestamp}`,
                gridy: `https://api.dicebear.com/7.x/gridy/svg?seed=${seed}&t=${timestamp}`,
                human: `https://api.dicebear.com/7.x/human/svg?seed=${seed}&t=${timestamp}`,
                avataaars: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&t=${timestamp}`,
            };

            // Example: use 'bottts'
            avatarImg.src = dicebearStyles.bottts;

            // To switch styles, just set to any of the above, e.g.:
            // avatarImg.src = dicebearStyles.pixelArtNeutral;
            // avatarImg.src = dicebearStyles.micah;
            // avatarImg.src = dicebearStyles.gridy;
            // avatarImg.src = dicebearStyles.human;
            // avatarImg.src = dicebearStyles.avataaars;
        }
    }

    // Draw main performance chart with correct theme
    const perfCanvas = document.getElementById("performanceChart");
    mainChartData = randomChartData();
    drawChartJS(perfCanvas, mainChartData);
    chartInstances.push({ canvas: perfCanvas, data: mainChartData });

    // Render portfolio and watchlist
    const portfolioContainer = document.getElementById("portfolio");
    portfolioData.forEach((stock) => {
        portfolioContainer.appendChild(createStockCard(stock));
    });

    const watchlistContainer = document.getElementById("watchlist");
    watchlistData.forEach((stock) => {
        watchlistContainer.appendChild(createStockCard(stock));
    });
});

// =====================
// Manual Toggle Function
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

    redrawAllCharts();
}

// =====================
// Chart Handling
// =====================
function drawChartJS(canvas, data = []) {
    const isDark = document.body.classList.contains("dark-mode");

    const borderColor = isDark ? "#ffd700" : "#2a73f5";
    const backgroundColor = isDark
        ? "rgba(255, 165, 0, 0.1)"
        : "rgba(42, 115, 245, 0.1)";

    if (chartMap.has(canvas)) {
        chartMap.get(canvas).destroy();
    }

    const chart = new Chart(canvas, {
        type: "line",
        data: {
            labels: Array(data.length).fill(""),
            datasets: [
                {
                    data,
                    borderColor,
                    tension: 0.4,
                    fill: true,
                    backgroundColor,
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
                x: { display: false },
                y: { display: false },
            },
        },
    });

    chartMap.set(canvas, chart);
}

function redrawAllCharts() {
    chartInstances.forEach(({ canvas, data }) => {
        drawChartJS(canvas, data);
    });
}

// =====================
// Utility: random chart data
// =====================
function randomChartData() {
    return Array.from({ length: 8 }, () => Math.floor(Math.random() * 10) + 1);
}

// =====================
// Dummy stock data
// =====================
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

// =====================
// Stock card generator
// =====================
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

    const chartData = randomChartData();
    drawChartJS(canvas, chartData);
    chartInstances.push({ canvas, data: chartData });

    return card;
}

// =====================
// Navigation
// =====================
function goHome() {
    window.location.href = "home.html";
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}
