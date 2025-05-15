package dev.jumpers.StockPulse.controller;

import dev.jumpers.StockPulse.util.ApiKeyManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    @Autowired
    private ApiKeyManager keyManager;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/quote")
    public ResponseEntity<?> getQuote(@RequestParam String symbol) {
        for (int i = 0; i < 30; i++) {
            String key = keyManager.getFinnhubKey();
            String url = "https://finnhub.io/api/v1/quote?symbol=" + symbol + "&token=" + key;

            try {
                ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
                return ResponseEntity.ok(response.getBody());
            } catch (HttpClientErrorException.TooManyRequests ex) {
                keyManager.rotateFinnhubKey();
            } catch (Exception ex) {
                return ResponseEntity.status(500).body("Internal error: " + ex.getMessage());
            }
        }
        return ResponseEntity.status(429).body("All Finnhub keys exhausted.");
    }

    @GetMapping("/chart")
    public ResponseEntity<?> getChart(@RequestParam String symbol) {
        for (int i = 0; i < 30; i++) {
            String key = keyManager.getAlphaKey();
            String url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" +
                    symbol + "&interval=5min&apikey=" + key;

            try {
                ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
                return ResponseEntity.ok(response.getBody());
            } catch (HttpClientErrorException.TooManyRequests ex) {
                keyManager.rotateAlphaKey();
            } catch (Exception ex) {
                return ResponseEntity.status(500).body("Internal error: " + ex.getMessage());
            }
        }
        return ResponseEntity.status(429).body("All Alpha Vantage keys exhausted.");
    }
}