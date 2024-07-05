import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as postmark from 'postmark'

import { EmailConstants } from '../utils'

export interface MailDto {
	emailRecipient: string
	emailSubject: string
	htmlContent: string
}

@Injectable()
export class PostMarkService {
	private client: postmark.ServerClient

	constructor(private configService: ConfigService) {
		const postmarkServerKey = this.configService.get<string>(
			EmailConstants.POSTMARK_SERVER_API_KEY
		)
		this.client = new postmark.ServerClient(postmarkServerKey)
	}

	async sendEmail({
		emailRecipient,
		emailSubject,
		htmlContent
	}: MailDto): Promise<void> {
		try {
			await this.client.sendEmail({
				From: this.configService.get<string>(EmailConstants.MAIL_SENDER_EMAIL),
				To: emailRecipient,
				Subject: emailSubject,
				HtmlBody: htmlContent
			})
		} catch (error) {
			throw new InternalServerErrorException(
				`Failed to send email: ${error.message}`
			)
		}
	}
}
