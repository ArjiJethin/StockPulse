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
    document.getElementById("company-name").innerText = "Tesla";

    const random = (min, max) => Math.random() * (max - min) + min;

    // Dummy data
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
        { title: "Market Update: Stocks Stage Rally", time: "2 hours ago" },
        {
            title: `${symbol} Recalls Nearly 3,900 Cybertrucks`,
            time: "4 hours ago",
        },
        { title: "5 Things to Know Before Markets Open", time: "7 hours ago" },
    ];

    const profileText =
        "Tesla, Inc. designs, manufactures, and sells electric vehicles and energy storage systems. Headquartered in Austin, Texas.";

    // Populate page
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

    const ctx = document.getElementById("priceChart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            datasets: [
                {
                    label: "Price",
                    data: [
                        random(1000, 1200),
                        random(1050, 1250),
                        random(1030, 1270),
                        random(1080, 1300),
                        stats.price,
                    ],
                    borderColor: "#007bff",
                    fill: false,
                    tension: 0.3,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
        },
    });

    const total = ratings.buy + ratings.hold + ratings.sell;
    const ratingsCtx = document.getElementById("ratingsChart").getContext("2d");
    new Chart(ratingsCtx, {
        type: "doughnut",
        data: {
            labels: ["Buy", "Hold", "Sell"],
            datasets: [
                {
                    data: [ratings.buy, ratings.hold, ratings.sell],
                    backgroundColor: ["#007bff", "#ccc", "#f44336"],
                },
            ],
        },
        options: {
            plugins: {
                legend: { position: "bottom" },
            },
        },
    });

    const ratingsBreakdown = document.getElementById("ratings-breakdown");
    ratingsBreakdown.innerHTML = `
      <li>Buy: ${ratings.buy}%</li>
      <li>Hold: ${ratings.hold}%</li>
      <li>Sell: ${ratings.sell}%</li>
    `;
});
