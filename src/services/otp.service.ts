import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'

@Injectable()
export class OtpService {
	constructor() {}

	generateOtp(): string {
		const code = crypto.randomBytes(3).readUIntLE(0, 3) % 1000000
		return code.toString().padStart(6, '0')
	}
}
