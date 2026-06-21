import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { RouteAnalyticsService } from './route-analytics.service';
import { PriceEstimationService } from './price-estimation.service';
import { SurgePricingService } from './surge-pricing.service';
import { ExportService } from './export.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  providers: [
    AnalyticsService,
    RouteAnalyticsService,
    PriceEstimationService,
    SurgePricingService,
    ExportService,
  ],
  controllers: [AnalyticsController],
  exports: [
    AnalyticsService,
    RouteAnalyticsService,
    PriceEstimationService,
    SurgePricingService,
    ExportService,
  ],
})
export class AnalyticsModule {}
