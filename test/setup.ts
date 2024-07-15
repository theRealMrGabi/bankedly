jest.mock('postmark', () => ({
	ServerClient: jest.fn(() => ({
		sendEmail: jest.fn()
	}))
}))

jest.mock('cache-manager-redis-store', () => ({
	redisStore: jest.fn().mockResolvedValue({
		get: jest.fn(),
		set: jest.fn(),
		del: jest.fn()
	})
}))
