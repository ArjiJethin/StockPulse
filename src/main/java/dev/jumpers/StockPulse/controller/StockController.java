package dev.jumpers.StockPulse.controller;

import dev.jumpers.StockPulse.util.ApiKeyManager;
import dev.jumpers.StockPulse.service.ChartCacheService; // <-- import service
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/stocks")
public class StockController {

    @Autowired
    private ApiKeyManager keyManager;

    @Autowired
    private ChartCacheService chartCacheService; // <-- inject service

    private final RestTemplate restTemplate = new RestTemplate();

    // Cache key format: "quote-IBM", "chart-AAPL"
    private final ConcurrentHashMap<String, CachedResponse> cache = new ConcurrentHashMap<>();
    private static final Duration CACHE_EXPIRY = Duration.ofHours(24);

    @GetMapping("/quote")
    public ResponseEntity<?> getQuote(@RequestParam String symbol) {
        String cacheKey = "quote-" + symbol.toUpperCase();
        CachedResponse cached = cache.get(cacheKey);

        if (cached != null && !cached.isExpired()) {
            System.out.println("📦 Serving quote for " + symbol + " from cache");
            return ResponseEntity.ok(cached.getResponse());
        }

        try {
            for (int i = 0; i < 30; i++) {
                String key = keyManager.getFinnhubKey();
                String url = "https://finnhub.io/api/v1/quote?symbol=" + symbol + "&token=" + key;

                try {
                    ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
                    logUsage("Finnhub");
                    cache.put(cacheKey, new CachedResponse(response.getBody(), Instant.now()));
                    System.out.println("🆕 Fetched fresh quote from API for " + symbol);
                    return ResponseEntity.ok(response.getBody());
                } catch (HttpClientErrorException.TooManyRequests ex) {
                    System.out.println("⛔ Finnhub key hit limit for quote: " + symbol);
                    keyManager.rotateFinnhubKey();
                }
            }
            System.out.println("⚠️ All Finnhub keys exhausted for quote: " + symbol);
            return ResponseEntity.status(429).body("All Finnhub keys exhausted.");
        } catch (Exception ex) {
            System.out.println("❌ Error fetching quote for " + symbol + ": " + ex.getMessage());
            return ResponseEntity.status(500).body("Internal error: " + ex.getMessage());
        } finally {
            keyManager.clearKeyUsage();
        }
    }

    @GetMapping("/chart")
    public ResponseEntity<?> getChart(@RequestParam String symbol) {
        String cached = chartCacheService.getChart(symbol);

        if (cached != null) {
            System.out.println("📦 Serving chart for " + symbol + " from cache");
            return ResponseEntity.ok(cached);
        }

        try {
            for (int i = 0; i < 30; i++) {
                String key = keyManager.getAlphaKey();
                String url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" +
                        symbol + "&interval=5min&apikey=" + key;

                try {
                    ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
                    logUsage("AlphaVantage");

                    String body = response.getBody();

                    if (chartCacheService.isValidChartData(body)) {
                        chartCacheService.putChart(symbol, body);
                        System.out.println("🆕 Fetched fresh chart data from API for " + symbol);
                    } else {
                        System.out.println("⚠️ Invalid chart data received from API for " + symbol + ", not caching");
                    }

                    return ResponseEntity.ok(body);

                } catch (HttpClientErrorException.TooManyRequests ex) {
                    keyManager.rotateAlphaKey();
                }
            }

            System.out.println("⚠️ All Alpha Vantage keys exhausted. No data fetched for " + symbol);
            return ResponseEntity.status(429).body("All Alpha Vantage keys exhausted.");

        } catch (Exception ex) {
            System.out.println("❌ Error fetching chart for " + symbol + ": " + ex.getMessage());

            // Fallback: stale cache from DB
            String fallback = chartCacheService.getChart(symbol);
            if (fallback != null) {
                System.out.println("⚠️ Using stale cache chart for " + symbol);
                return ResponseEntity.ok(fallback);
            }

            return ResponseEntity.status(500).body("Internal error: " + ex.getMessage());
        } finally {
            keyManager.clearKeyUsage();
        }
    }

    private void logUsage(String provider) {
        if (provider.equals("Finnhub")) {
            System.out.printf("✅ Used %d out of %d Finnhub keys%n",
                    keyManager.getUsedFinnhubKeyCount(), keyManager.getTotalFinnhubKeys());
        } else if (provider.equals("AlphaVantage")) {
            System.out.printf("✅ Used %d out of %d Alpha Vantage keys%n",
                    keyManager.getUsedAlphaKeyCount(), keyManager.getTotalAlphaKeys());
        }
    }

    // Inner class to hold cached data and timestamp
    private static class CachedResponse {
        private final String response;
        private final Instant cachedAt;

        public CachedResponse(String response, Instant cachedAt) {
            this.response = response;
            this.cachedAt = cachedAt;
        }

        public String getResponse() {
            return response;
        }

        public boolean isExpired() {
            return Instant.now().isAfter(cachedAt.plus(CACHE_EXPIRY));
        }
    }
}
