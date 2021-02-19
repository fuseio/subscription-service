import { Document } from 'mongoose'
import { Service } from 'typedi'
import UserSubscription from '../models/UserSubscription'
import UserService from './user'

@Service()
export default class UserSubscriptionService {
  constructor (private readonly userService: UserService) {}

  async createSubscription (eventName: string, webhookUrl: string, user: Document) {
    const hasSubscribed = await this.hasSubscription(eventName, user)
    if (hasSubscribed) {
      throw new Error('Already subscribed')
    }

    const subscription = await UserSubscription.create(
      {
        eventName,
        webhookUrl,
        user
      }
    )
    return subscription
  }

  async hasSubscription (eventName: string, user: Document) {
    const exists = await UserSubscription.exists({ eventName, user })
    return exists
  }

  async removeSubscription (eventName: string, user: Document) {
    await UserSubscription.deleteOne({ eventName, user })
  }

  async getSubscriptions () {
    const subscriptions = await UserSubscription.find({}).populate('user')
    return subscriptions.map((sub) => sub.toObject())
  }

  async getSubscription (eventName: string, address: string) {
    const user = await this.userService.getUser(address)
    const subscription = await UserSubscription.findOne(
      {
        eventName,
        user
      }
    )
    return subscription?.toObject()
  }
}
