package dev.jumpers.StockPulse.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class ApiKeyManager {

    @Value("#{'${finnhub.keys}'.split(',')}")
    private List<String> finnhubKeys;

    @Value("#{'${alphavantage.keys}'.split(',')}")
    private List<String> avKeys;

    private final AtomicInteger finnhubIndex = new AtomicInteger(0);
    private final AtomicInteger avIndex = new AtomicInteger(0);

    private final ThreadLocal<Set<String>> usedFinnhubKeys = ThreadLocal.withInitial(HashSet::new);
    private final ThreadLocal<Set<String>> usedAlphaKeys = ThreadLocal.withInitial(HashSet::new);

    public String getFinnhubKey() {
        String key = finnhubKeys.get(finnhubIndex.get() % finnhubKeys.size());
        usedFinnhubKeys.get().add(key);
        return key;
    }

    public void rotateFinnhubKey() {
        finnhubIndex.incrementAndGet();
    }

    public String getAlphaKey() {
        String key = avKeys.get(avIndex.get() % avKeys.size());
        usedAlphaKeys.get().add(key);
        return key;
    }

    public void rotateAlphaKey() {
        avIndex.incrementAndGet();
    }

    public int getTotalFinnhubKeys() {
        return finnhubKeys.size();
    }

    public int getUsedFinnhubKeyCount() {
        return usedFinnhubKeys.get().size();
    }

    public int getTotalAlphaKeys() {
        return avKeys.size();
    }

    public int getUsedAlphaKeyCount() {
        return usedAlphaKeys.get().size();
    }

    public void clearKeyUsage() {
        usedFinnhubKeys.remove();
        usedAlphaKeys.remove();
    }
}
