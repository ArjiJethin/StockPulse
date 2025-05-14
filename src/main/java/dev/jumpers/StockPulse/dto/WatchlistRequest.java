package dev.jumpers.StockPulse.dto;

public class WatchlistRequest {
    private String stockSymbol;

    public String getStockSymbol() {
        return stockSymbol;
    }

    public void setStockSymbol(String stockSymbol) {
        this.stockSymbol = stockSymbol;
    }
}
