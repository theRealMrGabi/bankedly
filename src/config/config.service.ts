import { ConfigService } from '@nestjs/config'
import * as fs from 'fs'
import * as dotenv from 'dotenv'

export class ConfigServiceSetup {
	private static instance: ConfigService

	static getInstance(): ConfigService {
		if (!ConfigServiceSetup.instance) {
			const envFile = `.env.${process.env.NODE_ENV}`

			if (fs.existsSync(envFile)) {
				console.log(`Loading environment variables from ${envFile}`)
				dotenv.config({ path: envFile })
			} else {
				console.warn(`${envFile} not found, loading default .env file`)
				dotenv.config()
			}

			ConfigServiceSetup.instance = new ConfigService()
		}
		return ConfigServiceSetup.instance
	}
}
