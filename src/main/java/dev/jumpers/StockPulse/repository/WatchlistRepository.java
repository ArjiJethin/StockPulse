package dev.jumpers.StockPulse.repository;

import dev.jumpers.StockPulse.model.User;
import dev.jumpers.StockPulse.model.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WatchlistRepository extends JpaRepository<WatchlistItem, Long> {
    List<WatchlistItem> findByUser(User user);

    void deleteByUserAndStockSymbol(User user, String stockSymbol);
}
