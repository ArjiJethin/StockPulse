const chartInstances = [];

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

const companyData = {
    AAPL: { logo: "https://logo.clearbit.com/apple.com" },
    MSFT: { logo: "https://logo.clearbit.com/microsoft.com" },
    AMZN: { logo: "https://logo.clearbit.com/amazon.com" },
    NVDA: { logo: "https://logo.clearbit.com/nvidia.com" },
    TSLA: { logo: "https://logo.clearbit.com/tesla.com" },
    GOOGL: { logo: "https://logo.clearbit.com/abc.xyz" },
    NFLX: { logo: "https://logo.clearbit.com/netflix.com" },
    AMD: { logo: "https://logo.clearbit.com/amd.com" },
    META: { logo: "https://logo.clearbit.com/meta.com" },
};

function getLogo(symbol) {
    return (
        companyData[symbol.toUpperCase()]?.logo ||
        "https://via.placeholder.com/48"
    );
}

document.addEventListener("DOMContentLoaded", () => {
    const darkModeState = localStorage.getItem("darkMode");
    if (darkModeState === "enabled") {
        document.body.classList.add("dark-mode");
    }
    fetchAllData();

    const username = localStorage.getItem("username");
    if (!username) {
        alert("Please log in first.");
        window.location.href = "index.html";
        return;
    }
});

function darkMode() {
    document.body.classList.toggle("dark-mode");

    const currentMode = document.body.classList.contains("dark-mode")
        ? "enabled"
        : "disabled";
    localStorage.setItem("darkMode", currentMode);

    autoScrollSummaryBar();

    // 🔁 Re-render charts with new theme colors
    chartInstances.forEach((chart) => {
        const ctx = chart.ctx;
        const { borderColor, gradientFrom, gradientTo } = getChartColors();
        const gradient = ctx.createLinearGradient(0, 0, 0, 100);
        gradient.addColorStop(0, gradientFrom);
        gradient.addColorStop(1, gradientTo);

        chart.data.datasets[0].borderColor = borderColor;
        chart.data.datasets[0].backgroundColor = gradient;
        chart.update();
    });
}

function getChartColors() {
    const isDark = document.body.classList.contains("dark-mode");
    return {
        borderColor: isDark ? "#ffd700" : "#4da1ff",
        gradientFrom: isDark
            ? "rgba(255, 165, 0, 0.25)"
            : "rgba(77, 161, 255, 0.6)",
        gradientTo: isDark
            ? "rgba(255, 165, 0, 0.03)"
            : "rgba(77, 161, 255, 0.05)",
    };
}

function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

let scrollInterval;

function autoScrollSummaryBar() {
    const summary = document.getElementById("stock-summary");
    if (!summary || summary.scrollWidth <= summary.clientWidth) {
        console.log("No need to scroll — summary bar does not overflow.");
        return;
    }

    if (scrollInterval) clearInterval(scrollInterval);

    scrollInterval = setInterval(() => {
        // Increment scrollLeft by 1px
        summary.scrollLeft += 1;

        // Reset scroll to start when reaching max scroll width
        if (summary.scrollLeft >= summary.scrollWidth - summary.clientWidth) {
            summary.scrollLeft = 0;
        }
    }, 30);
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

function getDummyChartData() {
    return [1, 2, 3, 2.5, 3.5];
}

async function fetchQuote(symbol) {
    try {
        const url = `/api/stocks/quote?symbol=${symbol}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        if (!data.c) throw new Error("Invalid quote data");

        const price = data.c;
        const prevClose = data.pc;
        const change = price - prevClose;
        const percentChange = ((change / prevClose) * 100).toFixed(2);

        const result = {
            symbol,
            price: price.toFixed(2),
            change: `${change >= 0 ? "+" : ""}${percentChange}%`,
            numericChange: parseFloat(percentChange),
        };

        // ✅ Log the successful quote fetch
        console.log(`✅ Fetched quote data for ${symbol}:`, result);

        return result;
    } catch (err) {
        console.warn(
            `⚠️ Fetch quote failed for ${symbol}, using dummy data`,
            err
        );
        return {
            symbol,
            price: "100.00",
            change: "+0.00",
            numericChange: 0,
        };
    }
}

async function fetchChartFromAlpha(symbol) {
    try {
        const url = `/api/stocks/chart?symbol=${symbol}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();

        if (!data["Time Series (5min)"]) throw new Error("Invalid chart data");

        const closePrices = Object.values(data["Time Series (5min)"])
            .slice(0, 5)
            .map((entry) => parseFloat(entry["4. close"]))
            .reverse();

        return closePrices;
    } catch (err) {
        console.warn(
            `Fetch chart failed for ${symbol}, using dummy chart`,
            err
        );
        return getDummyChartData();
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
                <img src="${getLogo(quote.symbol)}" alt="${
                    quote.symbol
                } logo" class="main-logo">
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
                setTimeout(() => {
                    document
                        .querySelectorAll(".details-btn")
                        .forEach((btn, idx) => {
                            btn.addEventListener("click", () => {
                                const symbol = stockSymbols[idx];
                                window.open(
                                    `stock.html?symbol=${symbol}`,
                                    "_blank"
                                );
                            });
                        });
                }, 0);

                document.getElementById(`skeleton-main-${i}`)?.remove();

                const ctx = document.getElementById(canvasId).getContext("2d");
                const chartData = await fetchChartFromAlpha(symbol);

                const { borderColor, gradientFrom, gradientTo } =
                    getChartColors();
                const gradient = ctx.createLinearGradient(0, 0, 0, 100);
                gradient.addColorStop(0, gradientFrom);
                gradient.addColorStop(1, gradientTo);

                const mainChart = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: ["1", "2", "3", "4", "5"],
                        datasets: [
                            {
                                data: chartData,
                                borderColor: borderColor,
                                backgroundColor: gradient,
                                tension: 0.4,
                                fill: true,
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
                chartInstances.push(mainChart);
            }

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

            const { borderColor, gradientFrom, gradientTo } = getChartColors();
            const gradient2 = ctx2.createLinearGradient(0, 0, 0, 100);
            gradient2.addColorStop(0, gradientFrom);
            gradient2.addColorStop(1, gradientTo);

            const smallChart = new Chart(ctx2, {
                type: "line",
                data: {
                    labels: ["1", "2", "3", "4", "5"],
                    datasets: [
                        {
                            data: chartData2,
                            borderColor: borderColor,
                            backgroundColor: gradient2,
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

            chartInstances.push(smallChart);
        } catch (err) {
            console.error("Fetch error:", symbol, err);
        }
        await delay(1200);
    }

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
