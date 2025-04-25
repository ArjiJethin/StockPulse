// Dummy stock data
const stockSummaryData = [
    { symbol: "AAPL", price: "172.32", change: "+0.23%" },
    { symbol: "MSFT", price: "310.65", change: "-0.4%" },
    { symbol: "NOT", price: "420.65", change: "+10.0%" },
    { symbol: "NVDA", price: "452.52", change: "+4.1%" },
];

const mainCardsData = [
    {
        name: "Tesla",
        ticker: "TSLA",
        percent: "+4.2%",
        logo: "https://cdn-icons-png.flaticon.com/512/732/732244.png",
    },
    {
        name: "Meta",
        ticker: "META",
        percent: "+2.0%",
        logo: "https://cdn-icons-png.flaticon.com/512/145/145802.png",
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
    { symbol: "NVDA", company: "Alubdincs", change: "+4.9%" },
];

// Populate stock summary
const stockSummary = document.getElementById("stock-summary");
stockSummaryData.forEach((stock) => {
    const div = document.createElement("div");
    div.className = "stock-item";
    div.innerHTML = `
      <div>${stock.symbol}</div>
      <div>${stock.price}</div>
      <div class="${stock.change.includes("+") ? "green" : "red"}">${
        stock.change
    }</div>
    `;
    stockSummary.appendChild(div);
});

// Populate main cards
const mainCards = document.getElementById("main-cards");
mainCardsData.forEach((stock) => {
    const card = document.createElement("div");
    card.className = "main-card";
    card.innerHTML = `
      <img src="${stock.logo}" alt="${stock.name}">
      <h2>${stock.name}</h2>
      <div class="percentage">${stock.percent}</div>
      <button class="details-btn">Details</button>
    `;
    mainCards.appendChild(card);
});

// Populate insights
const insightList = document.getElementById("insight-list");
insightsData.forEach((insight) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${insight.title}</strong>: ${
        insight.company
    } <span class="${insight.change.includes("+") ? "green" : "red"}">${
        insight.change
    }</span>`;
    insightList.appendChild(li);
});

// Populate all stocks
const allStocks = document.getElementById("all-stocks");
allStocksData.forEach((stock) => {
    const card = document.createElement("div");
    card.className = "small-stock-card";
    card.innerHTML = `
      <div>${stock.symbol}</div>
      <div>${stock.company}</div>
      <div class="${stock.change.includes("+") ? "green" : "red"}">${
        stock.change
    }</div>
    `;
    allStocks.appendChild(card);
});
