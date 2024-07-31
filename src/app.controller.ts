import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import { Public } from './interceptors/public-route.interceptor'

@Public()
@Controller({ version: '1' })
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHello(): string {
		return this.appService.getHello()
	}
}
