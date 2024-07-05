import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import { PostMarkService, MailDto } from './postmark.service'
import { EventsConstants } from '../utils'

@Injectable()
export class EmailEventHandlerService {
	constructor(private readonly postMarkService: PostMarkService) {}

	@OnEvent(EventsConstants.SEND_EMAIL)
	async handleSendEmailEvent(event: MailDto) {
		try {
			await this.postMarkService.sendEmail({
				...event
			})
		} catch (error) {
			throw new InternalServerErrorException(
				`Failed to send email: ${error.message}`
			)
		}
	}
}
