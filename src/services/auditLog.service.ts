import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IncomingWebhook, IncomingWebhookSendArguments } from '@slack/webhook'
import { EnvKeys } from '../utils'

export interface AuditLog {
	type: 'User activity' | 'Backoffice activity' | 'Server activity'
	action: string
	initiatedBy: string
	result: 'SUCCESS' | 'ERROR'
	metadata?: Record<string, any>
}

@Injectable()
export class AuditService {
	private webhook: IncomingWebhook

	constructor(private configService: ConfigService) {
		const url = this.configService.get<string>(EnvKeys.SLACK_WEBHOOK_URL)
		this.webhook = new IncomingWebhook(url)
	}

	async log({ action, initiatedBy, result, metadata, type }: AuditLog) {
		const log = {
			timeStamp: new Date().toString(),
			type,
			action,
			initiatedBy,
			result,
			metadata
		}

		delete metadata.password
		delete metadata.pin

		const message = {
			text: type,
			attachments: [
				{
					fields: [
						{
							title: 'Action',
							value: log.action
						},
						{
							title: 'Initiated by',
							value: log.initiatedBy
						},
						{
							title: 'Result',
							value: log.result
						},
						{
							title: 'Timestamp occured',
							value: log.timeStamp.toString()
						},
						{
							title: 'Metadata',
							value: JSON.stringify(log.metadata),
							short: false
						}
					]
				}
			]
		} satisfies IncomingWebhookSendArguments

		await this.webhook.send(message)
	}
}
