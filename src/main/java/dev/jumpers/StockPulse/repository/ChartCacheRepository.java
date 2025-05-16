package dev.jumpers.StockPulse.repository;

import dev.jumpers.StockPulse.entity.ChartCacheEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChartCacheRepository extends JpaRepository<ChartCacheEntity, String> {
}
