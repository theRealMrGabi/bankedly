import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	private logger = new Logger('HTTP')

	use(request: Request, response: Response, next: NextFunction): void {
		const { ip, method, originalUrl } = request
		const userAgent = request.get('user-agent') || ''

		response.on('finish', () => {
			const { statusCode } = response

			this.logger.log(
				`method:${method} originalUrl:${originalUrl} statusCode:${statusCode} - userAgent:${userAgent} ip:${ip}`
			)

			if (method !== 'GET') {
				delete request.body.password
				delete request.body.pin

				this.logger.debug(request.body)
			}
		})

		next()
	}
}
