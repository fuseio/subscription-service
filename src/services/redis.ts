import redis, { RedisClient } from 'redis'
import { Service } from 'typedi'

@Service()
export default class RedisService {
    readonly client: RedisClient

    constructor () {
      this.client = redis.createClient()
    }

    async set (key: string, value: string) {
      return new Promise<void>((resolve) => {
        this.client.set(key, value, () => {
          resolve()
        })
      })
    }

    async get (key: string) {
      return new Promise<string|null>((resolve, reject) => {
        this.client.get(key, (err, value) => {
          if (err) {
            reject(err)
          }
          resolve(value)
        })
      })
    }

    async disconnect () {
      await new Promise<void>((resolve) => {
        this.client.quit(() => {
          resolve()
        })
      })
    }
}
