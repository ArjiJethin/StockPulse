package dev.jumpers.StockPulse.controller;

import dev.jumpers.StockPulse.dto.WatchlistRequest;
import dev.jumpers.StockPulse.model.User;
import dev.jumpers.StockPulse.model.WatchlistItem;
import dev.jumpers.StockPulse.repository.UserRepository;
import dev.jumpers.StockPulse.repository.WatchlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/user")
public class WatchlistController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WatchlistRepository watchlistRepository;

    // Get current user's watchlist
    @GetMapping("/watchlist")
    public List<WatchlistItem> getWatchlist(Principal principal) {
        User user = userRepository.findByUsername(principal.getName());
        return watchlistRepository.findByUser(user);
    }

    // Debug: View a specific user's watchlist
    @GetMapping("/watchlist/debug/{username}")
    public ResponseEntity<List<WatchlistItem>> getWatchlistForDebug(@PathVariable String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        List<WatchlistItem> items = watchlistRepository.findByUser(user);
        return ResponseEntity.ok(items);
    }

    // Add a stock to watchlist
    @PostMapping("/watchlist")
    public ResponseEntity<?> addToWatchlist(@RequestBody WatchlistRequest request, Principal principal) {
        System.out.println("Saving stock: " + request.getStockSymbol() + " for user: " + principal.getName());

        User user = userRepository.findByUsername(principal.getName());
        WatchlistItem item = new WatchlistItem(request.getStockSymbol(), user);
        watchlistRepository.save(item);
        return ResponseEntity.ok("Added to watchlist");
    }

    // Remove a stock from watchlist
    @DeleteMapping("/watchlist/{symbol}")
    public ResponseEntity<?> removeFromWatchlist(@PathVariable String symbol, Principal principal) {
        User user = userRepository.findByUsername(principal.getName());
        watchlistRepository.deleteByUserAndStockSymbol(user, symbol);
        return ResponseEntity.ok("Removed from watchlist");
    }
}
