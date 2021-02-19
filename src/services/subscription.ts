import { Service } from 'typedi'

@Service()
export default class SubscriptionService {
    private readonly subscriptions: Map<string, Array<string>>

    constructor () {
      this.subscriptions = new Map()
    }

    subscribe (eventName: string, user: string) {
      this.addSubscription(eventName, user)
    }

    unsubscribe (eventName: string, user: string) {
      this.removeSubscription(eventName, user)
    }

    getSubscriptions () {
      return this.subscriptions
    }

    isSubscribed (eventName: string, user: string) {
      if (this.subscriptions.has(user)) {
        const subs = this.subscriptions.get(user)
        return subs ? subs.includes(eventName) : false
      }
      return false
    }

    private addSubscription (eventName: string, user: string) {
      if (this.subscriptions.has(user)) {
        const subs = this.subscriptions.get(user)

        if (subs && !subs.includes(eventName)) {
          subs.push(eventName)
          this.subscriptions.set(user, subs)
        }
      } else {
        this.subscriptions.set(user, [eventName])
      }
    }

    private removeSubscription (eventName: string, user: string) {
      if (this.subscriptions.has(user)) {
        const subs = this.subscriptions.get(user)

        if (subs && subs.includes(eventName)) {
          const subscriptions = subs.filter(sub => sub !== eventName)
          this.subscriptions.set(user, subscriptions)
        }
      }
    }
}
