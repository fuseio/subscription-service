import redis, { RedisClient } from 'redis'
import { Service } from 'typedi'
import UserService from '@services/user'
import userSubscription from '@models/UserSubscription'
import { UserDoc } from '@models/User'
import { promisify } from 'util'
import config from 'config'

@Service()
export default class SubscriptionService {
  client: RedisClient

  constructor (readonly userService: UserService) {
    this.client = redis.createClient(config.get('redis'))
  }

  async subscribe (user: UserDoc, eventName: string, webhookUrl: string) {
    const key = this.buildKey(user.address, eventName)

    await this.redisSet(key, eventName)
    const subscription = await userSubscription.create({
      eventName,
      webhookUrl,
      user
    })

    return subscription
  }

  async unsubscribe (user: UserDoc, eventName: string) {
    const key = this.buildKey(user.address, eventName)

    await this.redisDel(key)
    await userSubscription.deleteOne({
      eventName,
      user
    })
  }

  async isSubscribed (eventName?: string, address?: string) {
    if (!eventName || !address) return false

    const key = this.buildKey(address, eventName)

    const value = await this.redisGet(key)
    return !!value
  }

  async getSubscription (eventName?: string, address?: string) {
    if (!eventName || !address) return null

    const user = await this.userService.getUser(address)
    if (user) {
      const subscription = await userSubscription.findOne({
        eventName,
        user
      })
      return subscription
    }

    return null
  }

  private buildKey (address: string, eventName: string) {
    return `${address}_${eventName}`
  }

  private async redisGet (key: string) {
    const get = promisify(this.client.get)
      .bind(this.client)
    const value = await get(key)
    return value
  }

  private async redisSet (key: string, value: string) {
    const set = promisify(this.client.set)
      .bind(this.client)
    await set(key, value)
  }

  private async redisDel (key: string) {
    const del: (key: string | string[]) => Promise<number> =
      promisify(this.client.del).bind(this.client)
    await del(key)
  }
}
