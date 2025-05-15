// Fully Merged home.js: Summary scroll + Insights shrink + Main & Small Cards + Graphs + Logs

const FINNHUB_API_KEY = "d0it51hr01qofpon4upgd0it51hr01qofpon4uq0";
const ALPHA_VANTAGE_KEY = "BWJYSN2IQDKJ7D8Q";

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
const extraSummaryStocks = [
    "INTC",
    "CRM",
    "ORCL",
    "V",
    "BA",
    "PYPL",
    "UBER",
    "DIS",
];

document.addEventListener("DOMContentLoaded", () => {
    const darkModeState = localStorage.getItem("darkMode");
    if (darkModeState === "enabled") document.body.classList.add("dark-mode");
    fetchAllData();
});

function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

function autoScrollSummaryBar() {
    const summary = document.getElementById("stock-summary");
    if (!summary || summary.scrollWidth <= summary.clientWidth) {
        console.log("No need to scroll — summary bar does not overflow.");
        return;
    }

    let scrollAmount = 0;
    setInterval(() => {
        scrollAmount += 1;
        summary.scrollTo({ left: scrollAmount, behavior: "smooth" });
        if (scrollAmount >= summary.scrollWidth - summary.clientWidth) {
            scrollAmount = 0;
        }
    }, 60);
}

function injectSkeletons() {
    const summary = document.getElementById("stock-summary");
    const main = document.getElementById("main-cards");
    const insight = document.getElementById("insight-list");
    const small = document.getElementById("all-stocks");

    const totalSummary = stockSymbols.length + extraSummaryStocks.length;

    for (let i = 0; i < totalSummary; i++) {
        const div = document.createElement("div");
        div.className = "skeleton skeleton-stock-item";
        div.id = `skeleton-summary-${i}`;
        summary.appendChild(div);
    }

    for (let i = 0; i < 2; i++) {
        const div = document.createElement("div");
        div.className = "skeleton skeleton-main-card";
        div.id = `skeleton-main-${i}`;
        main.appendChild(div);
    }

    for (let i = 0; i < 5; i++) {
        const li = document.createElement("li");
        li.className = "skeleton skeleton-insight";
        li.id = `skeleton-insight-${i}`;
        insight.appendChild(li);
    }

    for (let i = 0; i < 8; i++) {
        const div = document.createElement("div");
        div.className = "skeleton skeleton-small-card";
        div.id = `skeleton-small-${i}`;
        small.appendChild(div);
    }
}

async function fetchQuote(symbol) {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log("Fetched quote data for", symbol, data);
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
        console.log("Fetched chart data for", symbol, data);

        if (!data["Time Series (5min)"])
            throw new Error("Alpha Vantage chart error");

        const closePrices = Object.values(data["Time Series (5min)"])
            .slice(0, 5)
            .map((entry) => parseFloat(entry["4. close"]))
            .reverse();
        return closePrices;
    } catch (err) {
        console.warn("Using dummy chart for", symbol, err.message);
        return [1, 2, 3, 2.5, 3.5];
    }
}

async function fetchAllData() {
    injectSkeletons();

    const stockSummary = document.getElementById("stock-summary");
    const mainCards = document.getElementById("main-cards");
    const insightList = document.getElementById("insight-list");
    const allStocks = document.getElementById("all-stocks");

    let quoteDataList = [];

    for (let i = 0; i < stockSymbols.length; i++) {
        const symbol = stockSymbols[i];
        try {
            console.log("Fetching quote and chart for:", symbol);
            const quote = await fetchQuote(symbol);
            quoteDataList.push(quote);
            document.getElementById(`skeleton-summary-${i}`)?.remove();

            const summaryDiv = document.createElement("div");
            summaryDiv.className = "stock-item";
            summaryDiv.innerHTML = `
        <div class="stock-symbol">${quote.symbol}</div>
        <div class="stock-price">${quote.price}</div>
        <div class="stock-change ${
            quote.change.includes("-") ? "red" : "green"
        }">
          ${quote.change.includes("-") ? "▼" : "▲"} ${quote.change}
        </div>`;
            stockSummary.appendChild(summaryDiv);

            // Main Cards (first 2)
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
                ${quote.change.includes("-") ? "▼" : "▲"} ${quote.change}
              </div>
            </div>
            <div class="main-graph-container">
              <canvas id="${canvasId}" width="240" height="100"></canvas>
            </div>
          </div>
          <button class="details-btn">Details</button>`;
                mainCards.appendChild(card);
                document.getElementById(`skeleton-main-${i}`)?.remove();

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

            // Small Cards
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
          <span class="${quote.change.includes("-") ? "red" : "green"}">${
                quote.change
            }</span>
        </div>`;
            cardLink.appendChild(smallCard);
            allStocks.appendChild(cardLink);
            document.getElementById(`skeleton-small-${i}`)?.remove();

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
            console.error("Fetch error:", symbol, err);
        }

        await delay(1200);
    }

    // Extra summary-only stocks
    for (let i = 0; i < extraSummaryStocks.length; i++) {
        const symbol = extraSummaryStocks[i];
        const skeletonId = stockSymbols.length + i;
        try {
            const quote = await fetchQuote(symbol);
            document.getElementById(`skeleton-summary-${skeletonId}`)?.remove();

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
        } catch (err) {
            console.warn("Extra summary fetch failed:", symbol, err.message);
        }

        await delay(1200);
    }

    // Top 5 insights
    const top5 = quoteDataList
        .filter((q) => !isNaN(q.numericChange))
        .sort((a, b) => b.numericChange - a.numericChange)
        .slice(0, 5);

    top5.forEach((quote, idx) => {
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
        document.getElementById(`skeleton-insight-${idx}`)?.remove();
    });

    document.getElementById("insight-container")?.classList.remove("loading");
    document.getElementById("insight-container")?.classList.add("loaded");

    autoScrollSummaryBar();
    console.log("Finished loading all stock data.");
}
