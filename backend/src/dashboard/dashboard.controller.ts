import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

/**
 * Contrôleur pour le dashboard
 */
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard - Récupère les données du dashboard
   */
  @Get()
  async getDashboard() {
    return this.dashboardService.getDashboardData();
  }
}
