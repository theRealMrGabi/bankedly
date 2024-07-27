import * as crypto from 'crypto'

export const generateOTPCode = () => {
	const code = crypto.randomBytes(3).readUIntLE(0, 3) % 1000000
	return code.toString().padStart(6, '0')
}
