import { Injectable, NotAcceptableException } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'

import { PaystackPaymentObject } from '../interface/payment.interface'
import { TransactionStatus } from '../transactions/transactions.interface'
import { EnvKeys } from '../utils'

@Injectable()
export class PaymentService {
	private paystackAxiosInstance: AxiosInstance

	constructor(private configService: ConfigService) {
		const paystackAxiosInstance = axios.create({
			baseURL: 'https://api.paystack.co',
			withCredentials: false,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.configService.get<string>(EnvKeys.PAYSTACK_SECRET_KEY)}`
			}
		})

		this.paystackAxiosInstance = paystackAxiosInstance
	}

	private generatePaymentReference() {
		return uuidv4()
	}

	async generatePaystackPaymentUrl({
		email,
		amount
	}: {
		email: string
		amount: number
	}): Promise<PaystackPaymentObject> {
		try {
			const body = {
				email,
				amount: amount,
				channels: ['card'],
				callback_url: this.configService.get<string>(
					EnvKeys.PAYSTACK_CALLBACK_URL
				),
				reference: this.generatePaymentReference()
			}

			const { data } = await this.paystackAxiosInstance.post(
				'/transaction/initialize',
				body
			)

			if (data && data.status) {
				return data.data as PaystackPaymentObject
			}

			return null
		} catch (error) {
			throw error
		}
	}

	async verifyPaystackPayment({
		reference,
		amount
	}: {
		reference: string
		amount: number
	}) {
		try {
			const { data } = await this.paystackAxiosInstance.get(
				`/transaction/verify/${reference}`
			)

			if (data && data.status) {
				const verifyResponse = data.data
				console.log('🚀 ==>paystack verifyResponse:', verifyResponse)
				const { amount: amountPaystackReceived, status } = verifyResponse

				if (amountPaystackReceived !== Number(amount)) {
					throw new NotAcceptableException(
						'Discrepancy discovered in this transaction. Contact support'
					)
				}

				if (status !== TransactionStatus.SUCCESS) return false

				if (status === TransactionStatus.SUCCESS) return true
			}

			return false
		} catch (error) {
			throw error
		}
	}
}
