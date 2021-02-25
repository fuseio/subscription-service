import { Service } from 'typedi'
import RedisService from './redis'

@Service()
export default class SubscriptionService {
  constructor (private readonly redisService: RedisService) {}

  async subscribe (eventName: string, user: string) {
    await this.addSubscription(eventName, user)
  }

  async unsubscribe (eventName: string, user: string) {
    await this.removeSubscription(eventName, user)
  }

  async isSubscribed (eventName: string, user: string) {
    const subsStr = await this.redisService.get(user)

    if (subsStr) {
      const subs = JSON.parse(subsStr)
      return subs ? subs.includes(eventName) : false
    }
    return false
  }

  private async addSubscription (eventName: string, user: string) {
    const subsStr = await this.redisService.get(user)

    if (subsStr) {
      const subs = JSON.parse(subsStr)

      if (!subs.includes(eventName)) {
        await this.redisService.set(
          user,
          JSON.stringify([...subs, eventName])
        )
      }
    } else {
      await this.redisService.set(user, JSON.stringify([eventName]))
    }
  }

  private async removeSubscription (eventName: string, user: string) {
    const subsStr = await this.redisService.get(user)

    if (subsStr) {
      const subs = JSON.parse(subsStr)

      if (subs && subs.includes(eventName)) {
        const newSub = subs.filter((sub: string) => sub !== eventName)
        await this.redisService.set(user, JSON.stringify(newSub))
      }
    }
  }
}
