import * as crypto from 'crypto'
import { rand, randNumber } from '@ngneat/falso'

export const generateSecureKey = () => crypto.randomBytes(32).toString('hex')

export const generateNigerianPhoneNumber = (): string => {
	const networkPrefixes = [
		'802',
		'803',
		'805',
		'806',
		'807',
		'703',
		'706',
		'813',
		'816',
		'810',
		'814',
		'903',
		'906'
	]

	const prefix = rand(networkPrefixes)
	const subscriberNumber = Math.floor(
		1000000 + Math.random() * 9000000
	).toString()

	return `+234${prefix}${subscriberNumber}`
}

export const generateRandomNumber = (length: number = 6): string => {
	const min = Math.pow(10, length - 1)
	const max = Math.pow(10, length) - 1
	return randNumber({ min, max }).toString()
}

export const extractTokenFromHeader = (
	authHeader: string
): string | undefined => {
	const [type, token] = authHeader?.split(' ') ?? []
	return type === 'Bearer' ? token : undefined
}

export * from './constants'
