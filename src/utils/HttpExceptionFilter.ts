import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException
} from '@nestjs/common'
import { Request, Response } from 'express'
import { EventEmitter2 } from '@nestjs/event-emitter'

import { EventsConstants } from './'
import { AuditLog } from '../services/auditLog.service'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	constructor(private eventEmitter: EventEmitter2) {}

	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()
		const status = exception.getStatus()

		// Log the error to the custom audit log if it's a 500-series error
		if (status >= 500 && status < 600) {
			delete request.body.password
			delete request.body.pin

			const metadata = {
				path: request.url,
				method: request.method,
				status,
				message: exception.message,
				stack: exception.stack,
				payload: request.body
			}

			this.eventEmitter.emit(EventsConstants.AUDIT_LOG, {
				type: 'Server activity',
				action: 'SERVER_ERROR',
				initiatedBy: 'System',
				result: 'ERROR',
				metadata
			} satisfies AuditLog)

			response.status(status).json({
				statusCode: status,
				message: exception.message
			})
		} else {
			return response.status(status).json({
				message: exception.message || 'Error occured',
				error: exception.name || 'Error',
				statusCode: status
			})
		}
	}
}
