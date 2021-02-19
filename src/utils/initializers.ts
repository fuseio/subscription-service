import config from 'config'
import Container from 'typedi'
import mongoose from 'mongoose'
import EventService from '../services/event'
import SubscriptionService from '../services/subscription'
import UserSubscriptionService from '../services/userSubscription'

export const initDb = () => {
  mongoose.set('debug', config.get('mongo.debug'))
  mongoose.set('useFindAndModify', false)
  mongoose.set('useCreateIndex', true)

  mongoose.connect(config.get('mongo.uri')).catch((error: any) => {
    console.error(error)
    process.exit(1)
  })
}

export const initServices = async () => {
  const eventService = Container.get(EventService)
  const userSubscriptionService = Container.get(UserSubscriptionService)
  const subscriptionService = Container.get(SubscriptionService)

  const subs: any = await userSubscriptionService.getSubscriptions()
  for (const sub of subs) {
    if (sub.eventName && sub.user && sub.user.address) {
      subscriptionService.subscribe(sub.eventName, sub.user.address)
    }
  }

  eventService.addHandlers()
  eventService.addEvents()
}
