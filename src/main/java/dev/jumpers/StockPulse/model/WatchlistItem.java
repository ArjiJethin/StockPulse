package dev.jumpers.StockPulse.model;

import jakarta.persistence.*;

@Entity
@Table(name = "watchlist")
public class WatchlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String stockSymbol;

    @ManyToOne
    private User user;

    public WatchlistItem() {
    }

    public WatchlistItem(String stockSymbol, User user) {
        this.stockSymbol = stockSymbol;
        this.user = user;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public String getStockSymbol() {
        return stockSymbol;
    }

    public void setStockSymbol(String stockSymbol) {
        this.stockSymbol = stockSymbol;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
