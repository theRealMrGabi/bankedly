export const EnvKeys = {
	REDIS_URL: 'REDIS_URL',
	REDIS_TTL: 'REDIS_TTL',
	POSTMARK_SERVER_API_KEY: 'POSTMARK_SERVER_API_KEY',
	MAIL_SENDER_EMAIL: 'MAIL_SENDER_EMAIL',
	MAIL_SENDER_NAME: 'MAIL_SENDER_NAME',
	DB_HOST: 'DB_HOST',
	DB_PORT: 'DB_PORT',
	DB_USERNAME: 'DB_USERNAME',
	DB_NAME: 'DB_NAME',
	DB_PASSWORD: 'DB_PASSWORD',
	JWT_TOKEN: 'JWT_TOKEN',
	JWT_ISSUER: 'JWT_ISSUER',
	ADMIN_SEEDED_EMAIL: 'ADMIN_SEEDED_EMAIL',
	ADMIN_SEEDED_PASSWORD: 'ADMIN_SEEDED_PASSWORD',
	ADMIN_SEEDED_USERNAME: 'ADMIN_SEEDED_USERNAME',
	ADMIN_SEEDED_PHONE_NUMBER: 'ADMIN_SEEDED_PHONE_NUMBER'
}

export const RedisKeys = {
	EMAIL_VALIDATION: 'EMAIL_VALIDATION',
	RESET_PASSWORD: 'RESET_PASSWORD',
	CACHE_TTL: 600, //ttl is 10mins,
	USER: 'USER',
	BLACKLIST_TOKEN: 'BLACKLIST_TOKEN'
}

export const EventsConstants = {
	SEND_EMAIL: 'send.email'
}
