import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import { AuditService, AuditLog } from '../auditLog.service'
import { EventsConstants } from '../../utils'

@Injectable()
export class AuditLogEventService {
	constructor(private auditService: AuditService) {}

	@OnEvent(EventsConstants.AUDIT_LOG)
	async handleAuditServiceLogs(event: AuditLog) {
		try {
			await this.auditService.log(event)
		} catch (error) {
			throw new InternalServerErrorException(
				`Failed to send audit log: ${error.message}`
			)
		}
	}
}
