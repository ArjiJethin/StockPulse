package dev.jumpers.StockPulse.util;

import java.time.Instant;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

public class ChartCache {

    private static final ConcurrentHashMap<String, CachedEntry> cache = new ConcurrentHashMap<>();
    private static final Duration CACHE_EXPIRY = Duration.ofHours(24);

    public static void put(String key, String data) {
        cache.put(key, new CachedEntry(data, Instant.now()));
    }

    public static String get(String key) {
        CachedEntry entry = cache.get(key);
        if (entry != null && !entry.isExpired()) {
            return entry.data;
        }
        // Remove stale entry
        cache.remove(key);
        return null;
    }

    private static class CachedEntry {
        String data;
        Instant cachedAt;

        CachedEntry(String data, Instant cachedAt) {
            this.data = data;
            this.cachedAt = cachedAt;
        }

        boolean isExpired() {
            return Instant.now().isAfter(cachedAt.plus(CACHE_EXPIRY));
        }
    }
}
