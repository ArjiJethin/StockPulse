package dev.jumpers.StockPulse.service;

import dev.jumpers.StockPulse.entity.ChartCacheEntity;
import dev.jumpers.StockPulse.repository.ChartCacheRepository;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Service
public class ChartCacheService {

    private final ChartCacheRepository repository;
    private static final Duration CACHE_EXPIRY = Duration.ofHours(24);

    public ChartCacheService(ChartCacheRepository repository) {
        this.repository = repository;
    }

    public String getChart(String symbol) {
        Optional<ChartCacheEntity> entryOpt = repository.findById(symbol.toUpperCase());
        if (entryOpt.isPresent()) {
            ChartCacheEntity entry = entryOpt.get();
            if (Instant.now().isBefore(entry.getCachedAt().plus(CACHE_EXPIRY))) {
                return entry.getChartData();
            } else {
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
        ChartCacheEntity entry = new ChartCacheEntity();
        entry.setSymbol(symbol.toUpperCase());
        entry.setChartData(data);
        entry.setCachedAt(Instant.now());
        repository.save(entry);
    }
}
