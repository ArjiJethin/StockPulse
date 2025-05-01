// ======================
// Dummy Data Definitions
// ======================

const stockSummaryData = [
    { symbol: "AAPL", price: "172.32", change: "+0.23%" },
    { symbol: "MSFT", price: "310.65", change: "-0.4%" },
    { symbol: "NOT", price: "420.65", change: "+10.0%" },
    { symbol: "NVDA", price: "452.52", change: "+4.1%" },
    { symbol: "TSLA", price: "775.52", change: "+3.1%" },
    { symbol: "AMZN", price: "118.32", change: "+1.8%" },
    { symbol: "GOOGL", price: "133.22", change: "-0.9%" },
    { symbol: "NFLX", price: "365.65", change: "-1.2%" },
    { symbol: "AMD", price: "123.50", change: "+4.9%" },
    { symbol: "META", price: "295.20", change: "+2.0%" },
];

const mainCardsData = [
    {
        name: "Tesla",
        ticker: "TSLA",
        percent: "+4.2%",
        logo: "https://cdn.iconscout.com/icon/free/png-256/tesla-11-569489.png",
    },
    {
        name: "Meta",
        ticker: "META",
        percent: "+2.0%",
        logo: "https://cdn-icons-png.flaticon.com/512/733/733547.png",
    },
];

const insightsData = [
    { title: "Top Gainers", company: "AMZN", change: "+5.3%" },
    { title: "Top Losers", company: "NFLX", change: "-3.1%" },
    { title: "Most Volatile", company: "AMD", change: "+4.8%" },
    { title: "Most Popular", company: "NVDA", change: "+4.1%" },
];

const allStocksData = [
    { symbol: "AAPL", company: "Apple Inc.", change: "+1.2%" },
    { symbol: "AMZN", company: "Amazon Inc.", change: "+5.3%" },
    { symbol: "GOOGL", company: "Alphabet", change: "-0.9%" },
    { symbol: "AMD", company: "AMD", change: "+4.8%" },
    { symbol: "NFLX", company: "Netflix", change: "-3.1%" },
    { symbol: "NVDA", company: "NVIDIA", change: "+4.9%" },
];

// ======================
// Populate Stock Summary
// ======================

const stockSummary = document.getElementById("stock-summary");

stockSummaryData.forEach((stock) => {
    const div = document.createElement("div");
    div.className = "stock-item";
    div.innerHTML = `
        <div class="stock-symbol">${stock.symbol}</div>
        <div class="stock-price">${stock.price}</div>
        <div class="stock-change ${
            stock.change.includes("+") ? "green" : "red"
        }">
            ${stock.change.includes("+") ? "▲" : "▼"} ${stock.change}
        </div>
    `;
    stockSummary.appendChild(div);
});

// Duplicate for infinite scroll
const items = Array.from(stockSummary.children);
items.forEach((item) => {
    const clone = item.cloneNode(true);
    stockSummary.appendChild(clone);
});

// Auto-scroll logic
setInterval(() => {
    stockSummary.scrollBy({ left: 1, behavior: "smooth" });
    if (stockSummary.scrollLeft >= stockSummary.scrollWidth / 2) {
        stockSummary.scrollLeft = 0;
    }
}, 30);

// ======================
// Populate Main Cards
// ======================

const mainCards = document.getElementById("main-cards");

mainCardsData.forEach((stock, index) => {
    const card = document.createElement("div");
    card.className = "main-card";
    const canvasId = `chart-${index}`;

    card.innerHTML = `
        <div class="main-card-header">
            <img src="${stock.logo}" alt="${stock.name}" class="main-logo">
            <div class="main-text">
                <h3>${stock.name}</h3>
                <p class="subtitle">${stock.name}, Inc.</p>
            </div>
        </div>
        <div class="main-card-body">
            <div class="main-change ${
                stock.percent.includes("+") ? "green" : "red"
            }">
                ${stock.percent.includes("+") ? "▲" : "▼"} ${stock.percent}
            </div>
            <canvas id="${canvasId}" width="100" height="30"></canvas>
        </div>
        <button class="details-btn">Details</button>
    `;

    mainCards.appendChild(card);

    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["1", "2", "3", "4", "5"],
            datasets: [
                {
                    data: [100, 102, 101, 110, 104],
                    borderColor: "#4da1ff",
                    backgroundColor: "transparent",
                    tension: 0.4,
                },
            ],
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
            elements: { point: { radius: 0 } },
            responsive: false,
            maintainAspectRatio: false,
        },
    });
});

// ======================
// Tilt Effect Function
// ======================

function attachCardTiltEffect(selector) {
    document.querySelectorAll(selector).forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // ⬇️ Reduced tilt strength
            const rotateX = -(y - centerY) / 30;
            const rotateY = (x - centerX) / 30;

            // ⬇️ Add smooth easing
            card.style.transition = "transform 0.1s ease-out";
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "rotateX(0) rotateY(0) scale(1)";
            card.style.transition = "transform 0.4s ease";
        });

        card.addEventListener("mouseenter", () => {
            // Optional: reset transition so mousemove overrides smoothly
            card.style.transition = "transform 0.2s ease";
        });
    });
}

// Attach the effect after cards exist
attachCardTiltEffect(".main-card");

// ======================
// Populate Insights
// ======================

const insightList = document.getElementById("insight-list");
insightsData.forEach((insight) => {
    const li = document.createElement("li");
    li.innerHTML = `
        <div class="insight-top">
            <strong>${insight.title}</strong>
            <span class="${insight.change.includes("+") ? "green" : "red"}">
                ${insight.change.includes("+") ? "▲" : "▼"} ${insight.change}
            </span>
        </div>
        <div class="insight-company">${insight.company}</div>
    `;
    insightList.appendChild(li);
});

// ======================
// Populate All Stocks
// ======================

const allStocks = document.getElementById("all-stocks");

allStocksData.forEach((stock, index) => {
    const card = document.createElement("div");
    card.className = "small-stock-card";
    const canvasId = `small-chart-${index}`;

    card.innerHTML = `
        <div class="stock-card-header">
            <strong>${stock.symbol}</strong>
            <p>${stock.company}</p>
        </div>
        <div class="stock-card-footer">
            <canvas id="${canvasId}" width="50" height="20"></canvas>
            <span class="${stock.change.includes("+") ? "green" : "red"}">
                ${stock.change}
            </span>
        </div>
    `;

    allStocks.appendChild(card);

    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["1", "2", "3", "4", "5"],
            datasets: [
                {
                    data: [20, 22, 21, 25, 24], // dummy data
                    borderColor: "#4da1ff",
                    backgroundColor: "transparent",
                    tension: 0.4,
                },
            ],
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
            elements: { point: { radius: 0 } },
            responsive: false,
            maintainAspectRatio: false,
        },
    });
});
