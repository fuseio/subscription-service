import redis, { RedisClient } from 'redis'
import { Service } from 'typedi'
import { promisify } from 'util'

@Service()
export default class RedisService {
    readonly client: RedisClient

    constructor () {
      this.client = redis.createClient()
    }

    async set (key: string, value: string) {
      const set = this.promisifyBind(this.client.set)
      await set(key, value)
    }

    async get (key: string) {
      const get = this.promisifyBind(this.client.get)
      const value = await get(key)
      return value
    }

    async disconnect () {
      const quit = this.promisifyBind(this.client.quit)
      await quit()
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    promisifyBind (fn: Function): Function {
      return promisify(fn).bind(this.client)
    }
}
