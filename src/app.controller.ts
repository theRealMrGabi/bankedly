import { Controller, Get } from '@nestjs/common'
import {
	HealthCheck,
	HealthCheckService,
	TypeOrmHealthIndicator
} from '@nestjs/terminus'

import { AppService } from './app.service'
import { Public } from './interceptors/public-route.interceptor'

@Public()
@Controller({ version: '1' })
export class AppController {
	constructor(
		private readonly appService: AppService,
		private health: HealthCheckService,
		private db: TypeOrmHealthIndicator
	) {}

	@Get()
	getHello(): string {
		return this.appService.getHello()
	}

	@Get('/health')
	@HealthCheck()
	healthCheck() {
		return this.health.check([
			async () => this.db.pingCheck('database', { timeout: 300 })
		])
	}
}
