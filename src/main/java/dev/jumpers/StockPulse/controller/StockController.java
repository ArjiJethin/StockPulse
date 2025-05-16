package dev.jumpers.StockPulse.controller;

import dev.jumpers.StockPulse.util.ApiKeyManager;
import dev.jumpers.StockPulse.service.ChartCacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.*;
import java.util.concurrent.ConcurrentHashMap;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/stocks")
public class StockController {

    @Autowired
    private ApiKeyManager keyManager;

    @Autowired
    private ChartCacheService chartCacheService;

    private final RestTemplate restTemplate = new RestTemplate();

    // In-memory cache for quotes only
    private final ConcurrentHashMap<String, CachedResponse> cache = new ConcurrentHashMap<>();

    @GetMapping("/quote")
    public ResponseEntity<?> getQuote(@RequestParam String symbol) {
        String cacheKey = "quote-" + symbol.toUpperCase();
        try {
            // Always try API first
            for (int i = 0; i < 30; i++) {
                String key = keyManager.getFinnhubKey();
                String url = "https://finnhub.io/api/v1/quote?symbol=" + symbol + "&token=" + key;
                try {
                    ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
                    logUsage("Finnhub");

                    String body = response.getBody();
                    cache.put(cacheKey, new CachedResponse(body, Instant.now()));

                    System.out.println("🆕 Fetched fresh quote from API for " + symbol + ". Cache updated.");
                    return ResponseEntity.ok(body);
                } catch (HttpClientErrorException.TooManyRequests ex) {
                    System.out.println("⛔ Finnhub key hit limit for quote: " + symbol);
                    keyManager.rotateFinnhubKey();
                }
            }

            // All keys exhausted, try cache
            System.out.println("⚠️ All Finnhub keys exhausted for quote: " + symbol + ". Trying cache fallback.");
            CachedResponse cached = cache.get(cacheKey);
            if (cached != null && !cached.isExpired()) {
                System.out.println("📦 Serving quote for " + symbol + " from cache fallback.");
                return ResponseEntity.ok(cached.getResponse());
            } else {
                System.out.println("❌ No valid cache available for quote: " + symbol);
                return ResponseEntity.status(429).body("All Finnhub keys exhausted and no cached data available.");
            }

        } catch (Exception ex) {
            System.out.println("❌ Error fetching quote for " + symbol + ": " + ex.getMessage());

            CachedResponse cached = cache.get(cacheKey);
            if (cached != null && !cached.isExpired()) {
                System.out.println("⚠️ Using cache fallback for quote " + symbol + " due to error.");
                return ResponseEntity.ok(cached.getResponse());
            }

            return ResponseEntity.status(500).body("Internal error: " + ex.getMessage());
        } finally {
            keyManager.clearKeyUsage();
        }
    }

    @GetMapping("/chart")
    public ResponseEntity<?> getChart(@RequestParam String symbol) {
        String cached = chartCacheService.getChart(symbol);

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
                        System.out.println("🆕 Fetched fresh chart data from API for " + symbol + ". Cache updated.");
                        return ResponseEntity.ok(body);
                    } else {
                        System.out.println("⚠️ Invalid chart data received from API for " + symbol
                                + ". Attempting to use cached data.");
                        if (cached != null) {
                            System.out.println("✅ Returning cached chart data for " + symbol);
                            return ResponseEntity.ok(cached);
                        } else {
                            System.out.println("❌ No cached data available for " + symbol);
                            return ResponseEntity.status(429).body("Rate limit hit and no cached data available.");
                        }
                    }

                } catch (HttpClientErrorException.TooManyRequests ex) {
                    keyManager.rotateAlphaKey();
                }
            }

            System.out.println("⚠️ All Alpha Vantage keys exhausted. No data fetched for " + symbol);
            if (cached != null) {
                System.out.println("✅ Returning cached chart data for " + symbol);
                return ResponseEntity.ok(cached);
            } else {
                return ResponseEntity.status(429)
                        .body("All Alpha Vantage keys exhausted and no cached data available.");
            }

        } catch (Exception ex) {
            System.out.println("❌ Error fetching chart for " + symbol + ": " + ex.getMessage());

            if (cached != null) {
                System.out.println("⚠️ Using stale cache chart for " + symbol);
                return ResponseEntity.ok(cached);
            }

            return ResponseEntity.status(500).body("Internal error: " + ex.getMessage());
        } finally {
            keyManager.clearKeyUsage();
        }
    }

    private void logUsage(String provider) {
        if ("Finnhub".equals(provider)) {
            System.out.printf("✅ Used %d out of %d Finnhub keys%n",
                    keyManager.getUsedFinnhubKeyCount(), keyManager.getTotalFinnhubKeys());
        } else if ("AlphaVantage".equals(provider)) {
            System.out.printf("✅ Used %d out of %d Alpha Vantage keys%n",
                    keyManager.getUsedAlphaKeyCount(), keyManager.getTotalAlphaKeys());
        }
    }

    // Inner class for in-memory cached responses with 6 AM reset logic
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
            Instant today6am = LocalDate.now()
                    .atTime(6, 0)
                    .atZone(ZoneId.systemDefault())
                    .toInstant();

            System.out.println("⏰ CachedAt: " + cachedAt + ", Today 6AM: " + today6am);

            return cachedAt.isBefore(today6am);
        }
    }
}
