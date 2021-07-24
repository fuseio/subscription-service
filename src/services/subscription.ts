import { Service } from 'typedi'
import UserService from '@services/user'
import userSubscription from '@models/UserSubscription'
import { UserDoc } from '@models/User'

@Service()
export default class SubscriptionService {
  constructor (readonly userService: UserService) {}

  async subscribe (user: UserDoc, eventName: string, webhookUrl: string) {
    const subscription = await userSubscription.create({
      eventName,
      webhookUrl,
      user
    })

    return subscription
  }

  async unsubscribe (user: UserDoc, eventName: string) {
    await userSubscription.deleteOne({
      eventName,
      user
    })
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
}
