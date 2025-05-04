document.addEventListener("DOMContentLoaded", () => {
    const darkModeState = localStorage.getItem("darkMode");
    if (darkModeState === "enabled") {
        document.body.classList.add("dark-mode");
    }
});

function darkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark-mode") ? "enabled" : "disabled"
    );
    renderChart(currentRange); // Re-render chart with theme
    renderRatingsChart(); // Re-render doughnut chart with theme
}

const companyNameMap = {
    AAPL: "Apple Inc.",
    AMZN: "Amazon Inc.",
    GOOGL: "Alphabet",
    AMD: "AMD",
    NFLX: "Netflix",
    NVDA: "NVIDIA",
    TSLA: "Tesla",
    META: "Meta",
};

function getSymbol() {
    const params = new URLSearchParams(location.search);
    return params.get("symbol") || "TSLA";
}

function formatBillion(value) {
    return `${(value / 1e9).toFixed(2)}B`;
}

function formatMillion(value) {
    return `${(value / 1e6).toFixed(2)}M`;
}

document.addEventListener("DOMContentLoaded", () => {
    const symbol = getSymbol();
    document.getElementById("stock-symbol").innerText = symbol;
    const name = companyNameMap[symbol.toUpperCase()] || symbol;
    document.getElementById("company-name").textContent = name;

    const random = (min, max) => Math.random() * (max - min) + min;

    const stats = {
        price: random(1100, 1300).toFixed(2),
        change: random(-15, 15).toFixed(2),
        marketStatus: "Market open",
        marketCap: formatBillion(random(500e9, 900e9)),
        peRatio: random(20, 70).toFixed(2),
        high52w: random(250, 400).toFixed(2),
        volume: formatMillion(random(20e6, 150e6)),
    };

    const financials = {
        revenue: formatBillion(random(60e9, 120e9)),
        netIncome: formatBillion(random(5e9, 25e9)),
        dividendYield: `${random(0.5, 3).toFixed(2)}%`,
    };

    const ratings = {
        buy: Math.floor(random(40, 70)),
        hold: Math.floor(random(20, 40)),
        sell: Math.floor(random(5, 15)),
    };

    const news = [
        {
            title: "Market Update: Stocks Rally as Yields Fall",
            time: "2 hours ago",
        },
        {
            title: `${symbol} Recalls Nearly 3,900 Cybertrucks`,
            time: "4 hours ago",
        },
        { title: "5 Things to Know Before Markets Open", time: "7 hours ago" },
    ];

    const profileText =
        "Tesla, Inc. designs, manufactures, and sells electric vehicles and energy storage systems.";

    // Populate UI
    document.getElementById("current-price").innerText = stats.price;
    document.getElementById("price-change").innerText = `${
        stats.change >= 0 ? "+" : ""
    }${stats.change} (${((stats.change / stats.price) * 100).toFixed(2)}%)`;
    document.getElementById("market-status").innerText = stats.marketStatus;
    document.getElementById("market-cap").innerText = stats.marketCap;
    document.getElementById("pe-ratio").innerText = stats.peRatio;
    document.getElementById("high-52w").innerText = stats.high52w;
    document.getElementById("volume").innerText = stats.volume;
    document.getElementById("revenue").innerText = financials.revenue;
    document.getElementById("net-income").innerText = financials.netIncome;
    document.getElementById("dividend-yield").innerText =
        financials.dividendYield;
    document.getElementById("company-profile").innerText = profileText;

    const newsList = document.getElementById("news-list");
    newsList.innerHTML = news
        .map(
            (n) =>
                `<li><strong>${n.title}</strong><br/><small>${n.time}</small></li>`
        )
        .join("");

    Chart.register({
        id: "lineShadow",
        beforeDatasetsDraw(chart) {
            const ctx = chart.ctx;
            chart.data.datasets.forEach((dataset, index) => {
                const meta = chart.getDatasetMeta(index);
                if (meta.type === "line" && meta.dataset) {
                    ctx.save();
                    ctx.shadowColor = "rgba(15, 127, 255, 0.5)";
                    ctx.shadowBlur = 20;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 4;
                    meta.dataset.draw(ctx);
                    ctx.restore();
                }
            });
        },
    });

    let chart;
    let currentRange = "1W";

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

    function generateChartData(range) {
        let labels = [],
            data = [],
            points = 0;

        switch (range) {
            case "1D":
                labels = ["9AM", "10AM", "11AM", "12PM", "1PM", "2PM"];
                points = 6;
                break;
            case "1W":
                labels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
                points = 5;
                break;
            case "1M":
                labels = Array.from({ length: 20 }, (_, i) => `Day ${i + 1}`);
                points = 20;
                break;
            case "3M":
                labels = ["Jan", "Feb", "Mar"];
                points = 12;
                break;
            case "1Y":
                labels = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                points = 12;
                break;
            case "All":
                labels = Array.from({ length: 10 }, (_, i) => `Y${2014 + i}`);
                points = 10;
                break;
            default:
                labels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
                points = 5;
        }

        data = Array.from({ length: points }, () =>
            random(1000, 1300).toFixed(2)
        );
        return { labels, data };
    }

    function renderChart(range = "1W") {
        currentRange = range;
        const { labels, data } = generateChartData(range);

        const ctx = document.getElementById("priceChart").getContext("2d");
        const { borderColor, gradientFrom, gradientTo } = getChartColors();
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, gradientFrom);
        gradient.addColorStop(1, gradientTo);

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "Price",
                        data,
                        borderColor,
                        backgroundColor: gradient,
                        tension: 0.4,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: false,
                        external(context) {
                            let tooltipEl = document.getElementById(
                                "chartjs-glass-tooltip"
                            );
                            if (!tooltipEl) {
                                tooltipEl = document.createElement("div");
                                tooltipEl.id = "chartjs-glass-tooltip";
                                document.body.appendChild(tooltipEl);
                            }

                            const tooltipModel = context.tooltip;
                            if (tooltipModel.opacity === 0) {
                                tooltipEl.style.opacity = 0;
                                return;
                            }

                            const dataPoint = tooltipModel.dataPoints?.[0];
                            const label = dataPoint?.label || "";
                            const value = dataPoint?.parsed?.y?.toFixed(2);

                            tooltipEl.innerHTML = `
                                <div class="glass-tooltip">
                                    <div class="tooltip-label">${label}</div>
                                    <div class="tooltip-value">Price: $${value}</div>
                                </div>
                            `;

                            const {
                                offsetLeft: positionX,
                                offsetTop: positionY,
                            } = context.chart.canvas;
                            tooltipEl.style.opacity = 1;
                            tooltipEl.style.position = "absolute";
                            tooltipEl.style.left =
                                positionX + tooltipModel.caretX + "px";
                            tooltipEl.style.top =
                                positionY + tooltipModel.caretY + "px";
                            tooltipEl.style.pointerEvents = "none";
                        },
                    },
                },
                interaction: {
                    mode: "nearest",
                    axis: "x",
                    intersect: false,
                },
                scales: {
                    x: { display: false },
                    y: { display: false },
                },
                elements: {
                    point: {
                        radius: 0,
                        hoverRadius: 6,
                        backgroundColor: "#0f7fff",
                    },
                },
            },
        });
    }

    document.querySelectorAll(".range-buttons button").forEach((button) => {
        button.addEventListener("click", () =>
            renderChart(button.getAttribute("data-range"))
        );
    });

    function renderRatingsChart() {
        const ratingsCtx = document
            .getElementById("ratingsChart")
            .getContext("2d");
        const totalRatings = ratings.buy + ratings.hold + ratings.sell;
        const buyPercentage = ((ratings.buy / totalRatings) * 100).toFixed(0);
        const isDark = document.body.classList.contains("dark-mode");

        new Chart(ratingsCtx, {
            type: "doughnut",
            data: {
                datasets: [
                    {
                        data: [ratings.buy, ratings.hold, ratings.sell],
                        backgroundColor: isDark
                            ? ["#ffd700", "#f0dc6ab0", "#f0dc6a5b"]
                            : ["#2F80ED", "#E5E9F0", "#D1D5DB"],
                        borderWidth: 0,
                    },
                ],
            },
            options: {
                cutout: "65%",
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: false,
                        external(context) {
                            let tooltipEl = document.getElementById(
                                "chartjs-glass-tooltip"
                            );
                            if (!tooltipEl) {
                                tooltipEl = document.createElement("div");
                                tooltipEl.id = "chartjs-glass-tooltip";
                                document.body.appendChild(tooltipEl);
                            }

                            const tooltipModel = context.tooltip;
                            if (tooltipModel.opacity === 0) {
                                tooltipEl.style.opacity = 0;
                                return;
                            }

                            const dataPoint = tooltipModel.dataPoints?.[0];
                            const label = ["Buy", "Hold", "Sell"][
                                dataPoint.dataIndex
                            ];
                            const value = dataPoint.raw;

                            tooltipEl.innerHTML = `
                                <div class="glass-tooltip">
                                    <div class="tooltip-label">${label}</div>
                                    <div class="tooltip-value">${value}%</div>
                                </div>
                            `;

                            const { offsetLeft: posX, offsetTop: posY } =
                                context.chart.canvas;
                            tooltipEl.style.opacity = 1;
                            tooltipEl.style.position = "absolute";
                            tooltipEl.style.left =
                                posX + tooltipModel.caretX + "px";
                            tooltipEl.style.top =
                                posY + tooltipModel.caretY + "px";
                            tooltipEl.style.pointerEvents = "none";
                        },
                    },
                },
            },
            plugins: [
                {
                    id: "centerText",
                    afterDraw(chart) {
                        const { width } = chart;
                        const { ctx } = chart;
                        const centerX = width / 2;
                        const centerY = chart.height / 2;
                        ctx.save();
                        ctx.font = "bold 20px sans-serif";
                        ctx.fillStyle = isDark ? "#ffd700" : "#333";
                        ctx.textAlign = "center";
                        ctx.fillText(`${buyPercentage}%`, centerX, centerY);
                        ctx.restore();
                    },
                },
            ],
        });

        document.getElementById("ratings-breakdown").innerHTML = `
            <li>Buy: ${ratings.buy}%</li>
            <li>Hold: ${ratings.hold}%</li>
            <li>Sell: ${ratings.sell}%</li>
        `;
    }

    renderChart("1W");
    renderRatingsChart();
});
