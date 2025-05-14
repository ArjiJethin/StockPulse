const FINNHUB_API_KEY = "API_KEY";
const ALPHA_VANTAGE_KEY = "API_KEY";

const stockSymbols = [
    "AAPL",
    "MSFT",
    "AMZN",
    "NVDA",
    "TSLA",
    "GOOGL",
    "NFLX",
    "AMD",
    "META",
];

const modeBtn = document.querySelector(".mode-btn");
document.addEventListener("DOMContentLoaded", () => {
    const darkModeState = localStorage.getItem("darkMode");
    if (darkModeState === "enabled") document.body.classList.add("dark-mode");
    fetchAllData();
});

function darkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark-mode") ? "enabled" : "disabled"
    );
}

function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

async function fetchQuote(symbol) {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    console.log(`Fetched quote for ${symbol}:`, data);

    if (!data.c) throw new Error("Invalid Finnhub quote data");

    const price = data.c;
    const prevClose = data.pc;
    const change = price - prevClose;
    const percentChange = ((change / prevClose) * 100).toFixed(2);

    return {
        symbol,
        price: price.toFixed(2),
        change: `${change >= 0 ? "+" : ""}${percentChange}%`,
        numericChange: parseFloat(percentChange),
    };
}

async function fetchChartFromAlpha(symbol) {
    try {
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${ALPHA_VANTAGE_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        console.log(`Fetched chart for ${symbol}:`, data);

        if (!data["Time Series (5min)"])
            throw new Error("Alpha Vantage data error");

        const closePrices = Object.values(data["Time Series (5min)"])
            .slice(0, 5)
            .map((entry) => parseFloat(entry["4. close"]))
            .reverse();

        return closePrices;
    } catch (err) {
        console.warn(`Using dummy chart data for ${symbol}:`, err.message);
        return [1, 2, 3, 2.5, 3.5];
    }
}

async function fetchAllData() {
    const stockSummary = document.getElementById("stock-summary");
    const mainCards = document.getElementById("main-cards");
    const insightList = document.getElementById("insight-list");
    const allStocks = document.getElementById("all-stocks");

    let quoteDataList = [];

    for (let i = 0; i < stockSymbols.length; i++) {
        const symbol = stockSymbols[i];
        try {
            const quote = await fetchQuote(symbol);
            quoteDataList.push(quote);

            // Summary card
            const div = document.createElement("div");
            div.className = "stock-item";
            div.innerHTML = `
                <div class="stock-symbol">${quote.symbol}</div>
                <div class="stock-price">${quote.price}</div>
                <div class="stock-change ${
                    quote.change.includes("-") ? "red" : "green"
                }">
                    ${quote.change.includes("-") ? "▼" : "▲"} ${quote.change}
                </div>`;
            stockSummary.appendChild(div);

            // Main card (top 2)
            if (i < 2) {
                const card = document.createElement("div");
                card.className = "main-card";
                const canvasId = `chart-${i}`;
                card.innerHTML = `
                    <div class="main-card-header">
                        <div class="main-text">
                            <h3>${quote.symbol}</h3>
                            <p class="subtitle">${quote.symbol}, Inc.</p>
                        </div>
                    </div>
                    <div class="main-card-body">
                        <div class="main-logo-change">
                            <img src="assets/Icons/Icon.png" alt="${
                                quote.symbol
                            }" class="main-logo">
                            <div class="main-change ${
                                quote.change.includes("-") ? "red" : "green"
                            }">
                                ${quote.change.includes("-") ? "▼" : "▲"} ${
                    quote.change
                }
                            </div>
                        </div>
                        <div class="main-graph-container">
                            <canvas id="${canvasId}" width="240" height="100"></canvas>
                        </div>
                    </div>
                    <button class="details-btn">Details</button>`;
                mainCards.appendChild(card);

                const ctx = document.getElementById(canvasId).getContext("2d");
                const chartData = await fetchChartFromAlpha(symbol);
                new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: ["1", "2", "3", "4", "5"],
                        datasets: [
                            {
                                data: chartData,
                                borderColor: "#4da1ff",
                                backgroundColor: "transparent",
                                tension: 0.4,
                            },
                        ],
                    },
                    options: {
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { display: false },
                            y: { display: false },
                        },
                        elements: { point: { radius: 0 } },
                        responsive: false,
                        maintainAspectRatio: false,
                    },
                });
            }

            // Small stock card
            const cardLink = document.createElement("a");
            cardLink.href = `stock.html?symbol=${quote.symbol}`;
            cardLink.target = "_blank";
            cardLink.className = "small-stock-card-link";

            const smallCard = document.createElement("div");
            smallCard.className = "small-stock-card";
            const canvasId2 = `small-chart-${i}`;
            smallCard.innerHTML = `
                <div class="stock-card-header">
                    <strong>${quote.symbol}</strong>
                    <p>${quote.symbol}, Inc.</p>
                </div>
                <div class="stock-card-footer">
                    <canvas id="${canvasId2}" width="50" height="20"></canvas>
                    <span class="${
                        quote.change.includes("-") ? "red" : "green"
                    }">${quote.change}</span>
                </div>`;
            cardLink.appendChild(smallCard);
            allStocks.appendChild(cardLink);

            const ctx2 = document.getElementById(canvasId2).getContext("2d");
            const chartData2 = await fetchChartFromAlpha(symbol);
            new Chart(ctx2, {
                type: "line",
                data: {
                    labels: ["1", "2", "3", "4", "5"],
                    datasets: [
                        {
                            data: chartData2,
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
        } catch (err) {
            console.error(`Error fetching data for ${symbol}:`, err.message);
        }

        await delay(1200); // API rate respect
    }

    // === Top 5 insights ===
    const top5 = quoteDataList
        .filter((q) => !isNaN(q.numericChange))
        .sort((a, b) => b.numericChange - a.numericChange)
        .slice(0, 5);

    for (const quote of top5) {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="insight-top">
                <strong>${quote.symbol}</strong>
                <span class="${quote.change.includes("-") ? "red" : "green"}">
                    ${quote.change.includes("-") ? "▼" : "▲"} ${quote.change}
                </span>
            </div>
            <div class="insight-company">Top Performing Stock</div>`;
        insightList.appendChild(li);
    }

    // === Extra stocks for scrolling summary ===
    const extraSummaryStocks = [
        "INTC",
        "BA",
        "DIS",
        "V",
        "MA",
        "PYPL",
        "CRM",
        "CSCO",
        "ORCL",
        "IBM",
        "UBER",
    ];
    for (let symbol of extraSummaryStocks) {
        try {
            const quote = await fetchQuote(symbol);
            const div = document.createElement("div");
            div.className = "stock-item";
            div.innerHTML = `
                <div class="stock-symbol">${quote.symbol}</div>
                <div class="stock-price">${quote.price}</div>
                <div class="stock-change ${
                    quote.change.includes("-") ? "red" : "green"
                }">
                    ${quote.change.includes("-") ? "▼" : "▲"} ${quote.change}
                </div>`;
            stockSummary.appendChild(div);
            await delay(1000);
        } catch (err) {
            console.warn(
                `Extra summary stock fetch failed: ${symbol}`,
                err.message
            );
        }
    }

    autoScrollSummaryBar();
    attachCardTiltEffect(".main-card");
}

// === Auto-scroll logic for summary bar ===
function autoScrollSummaryBar() {
    const summary = document.getElementById("stock-summary");
    if (!summary) return;

    let scrollAmount = 0;
    setInterval(() => {
        scrollAmount += 1;
        summary.scrollTo({ left: scrollAmount, behavior: "smooth" });

        if (scrollAmount >= summary.scrollWidth - summary.clientWidth) {
            scrollAmount = 0;
        }
    }, 120); // adjust speed here
}

function attachCardTiltEffect(selector) {
    document.querySelectorAll(selector).forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = -(y - centerY) / 30;
            const rotateY = (x - centerX) / 30;
            card.style.transition = "transform 0.1s ease-out";
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "rotateX(0) rotateY(0) scale(1)";
            card.style.transition = "transform 0.4s ease";
        });
        card.addEventListener("mouseenter", () => {
            card.style.transition = "transform 0.2s ease";
        });
    });
}
