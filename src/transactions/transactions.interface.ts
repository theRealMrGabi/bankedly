export enum TransactionType {
	DEPOSIT = 'deposit',
	WITHDRAW = 'withdraw',
	TRANSFER = 'transfer'
}

export enum TransactionGateway {
	PAYSTACK = 'paystack',
	FLUTTERWAVE = 'flutterwave',
	BANKEDLY = 'bankedly'
}

export enum TransactionStatus {
	IN_PROGRESS = 'in_progress',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled'
}

export interface TransactionDetail {
	gateway: TransactionGateway
	receiverAccountNumber: string
}
