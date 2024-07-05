import * as crypto from 'crypto'

export const generateSecureKey = () => crypto.randomBytes(32).toString('hex')

export const generateOTPCode = () => {
	const code = crypto.randomBytes(3).readUIntLE(0, 3) % 1000000
	return code.toString().padStart(6, '0')
}

export * from './constants'
