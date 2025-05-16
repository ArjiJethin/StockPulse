package dev.jumpers.StockPulse.service;

import dev.jumpers.StockPulse.entity.ChartCacheEntity;
import dev.jumpers.StockPulse.repository.ChartCacheRepository;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.*;
import java.util.Optional;

@Service
public class ChartCacheService {

    private final ChartCacheRepository repository;

    public ChartCacheService(ChartCacheRepository repository) {
        this.repository = repository;
    }

    public String getChart(String symbol) {
        Optional<ChartCacheEntity> entryOpt = repository.findById(symbol.toUpperCase());
        if (entryOpt.isPresent()) {
            ChartCacheEntity entry = entryOpt.get();
            Instant cachedAt = entry.getCachedAt();

            // Determine today's 6:00 AM timestamp in server's local timezone
            Instant today6am = LocalDate.now()
                    .atTime(LocalTime.of(6, 0))
                    .atZone(ZoneId.systemDefault())
                    .toInstant();

            System.out.println("⏰ Cache timestamp for " + symbol + ": " + cachedAt);
            System.out.println("🕕 Today's 6 AM cutoff: " + today6am);

            if (cachedAt.isAfter(today6am)) {
                System.out.println("✅ Cache is valid (after today's 6 AM)");
                return entry.getChartData();
            } else {
                System.out.println("⛔ Cache expired (before today's 6 AM). Deleting...");
                repository.delete(entry);
            }
        }
        return null;
    }

    public boolean isValidChartData(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            if (root.has("Information") || root.has("Error Message")) {
                return false; // API limit hit or other error
            }
            return true;
        } catch (Exception e) {
            return false; // Invalid JSON
        }
    }

    public void putChart(String symbol, String data) {
        String symbolUpper = symbol.toUpperCase();
        Optional<ChartCacheEntity> existingEntry = repository.findById(symbolUpper);

        ChartCacheEntity entry;
        if (existingEntry.isPresent()) {
            entry = existingEntry.get();
            System.out.println("🔄 Updating existing cache entry for symbol: " + symbolUpper);
        } else {
            entry = new ChartCacheEntity();
            entry.setSymbol(symbolUpper);
            System.out.println("➕ Creating new cache entry for symbol: " + symbolUpper);
        }

        entry.setChartData(data);
        entry.setCachedAt(Instant.now());
        repository.save(entry);
    }
}
