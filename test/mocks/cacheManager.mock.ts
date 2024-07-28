export class MockCache {
	private store: Map<string, any> = new Map()

	async get(key: string): Promise<any> {
		return this.store.get(key)
	}

	async set(key: string, value: any, ttl?: number): Promise<void> {
		this.store.set(key, value)
		if (ttl) {
			setTimeout(() => this.store.delete(key), ttl)
		}
	}

	async del(key: string): Promise<void> {
		this.store.delete(key)
	}

	clear(): void {
		this.store.clear()
	}
}
