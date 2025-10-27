import { Redis } from "ioredis";
import { Injectable } from "@nestjs/common";

import { HealthStatus } from "@modules/server/server.service";
import { ConfigService } from "@services/config/config.service";
import { SystemError } from "@services/errors/base/system.error";

export interface CacheOptions {
	epochExpiry: number;
}

@Injectable()
export class CacheStoreService {
	private redis: Redis | null = null;

	constructor(private configService: ConfigService) {}

	private getRedis(): Redis {
		if (this.redis) {
			return this.redis;
		} else {
			this.redis = new Redis(this.configService.vars.cacheStore.redisUrl);
			return this.redis;
		}
	}

	// todo: improve health check at all? stop ioredis logging to console but still expose errors?
	async healthCheck(): Promise<HealthStatus> {
		try {
			const redis = this.getRedis();
			await redis.ping();
			return "ok";
		} catch (error) {
			return "error";
		}
	}

	async addItem(key: string, value: string, options?: CacheOptions) {
		const redis = this.getRedis();

		try {
			if (options?.epochExpiry) {
				await redis.set(key, value, "EXAT", options.epochExpiry);
			} else {
				await redis.set(key, value);
			}
		} catch (e) {
			throw new SystemError({
				message: "Error adding item to cache store",
				cause: e,
			});
		}
	}

	async itemExists(key: string): Promise<boolean> {
		const redis = this.getRedis();

		try {
			// Using !! to convert 0/1 to false/true
			return !!(await redis.exists(key));
		} catch (e) {
			throw new SystemError({
				message: "Error fetching item from cache store",
				cause: e,
			});
		}
	}

	async getItem(key: string) {
		const redis = this.getRedis();
		return redis.get(key);
	}

	async purge() {
		const redis = this.getRedis();
		await redis.flushall();
	}

	onModuleDestroy() {
		const redis = this.getRedis();
		redis.disconnect();
	}
}
