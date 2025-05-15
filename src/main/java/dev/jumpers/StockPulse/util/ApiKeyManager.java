package dev.jumpers.StockPulse.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class ApiKeyManager {

    @Value("#{'${finnhub.keys}'.split(',')}")
    private List<String> finnhubKeys;

    @Value("#{'${alphavantage.keys}'.split(',')}")
    private List<String> avKeys;

    private final AtomicInteger finnhubIndex = new AtomicInteger(0);
    private final AtomicInteger avIndex = new AtomicInteger(0);

    public String getFinnhubKey() {
        return finnhubKeys.get(finnhubIndex.get() % finnhubKeys.size());
    }

    public void rotateFinnhubKey() {
        finnhubIndex.incrementAndGet();
    }

    public String getAlphaKey() {
        return avKeys.get(avIndex.get() % avKeys.size());
    }

    public void rotateAlphaKey() {
        avIndex.incrementAndGet();
    }
}