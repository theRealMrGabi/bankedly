import { NestFactory } from '@nestjs/core'
import { VersioningType } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'

import { AppModule } from './app.module'
import { HttpExceptionFilter } from './utils/HttpExceptionFilter'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.enableCors()

	app.setGlobalPrefix('api')
	app.enableVersioning({
		type: VersioningType.URI
	})

	const eventEmitter = app.get<EventEmitter2>(EventEmitter2)

	app.useGlobalFilters(new HttpExceptionFilter(eventEmitter))

	await app.listen(process.env.PORT || 3000)
}
bootstrap()
