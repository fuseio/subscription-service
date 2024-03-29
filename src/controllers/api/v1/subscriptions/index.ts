import { Request, Response, NextFunction } from 'express'
import Container from 'typedi'
import SubscriptionService from '@services/subscription'
import UserService from '@services/user'
import RequestError from '@models/RequestError'
import FilterStatus from '@models/FilterStatus'

export default class SubscriptionsController {
  static async subscribe (req: Request, res: Response, next: NextFunction) {
    try {
      const { eventName } = req.params
      const { address, webhookUrl } = req.body

      const userService = Container.get(UserService)
      const subscriptionService = Container.get(SubscriptionService)

      const subscription = await subscriptionService.getSubscription(
        eventName,
        address
      )

      if (subscription) {
        throw new RequestError(400, 'User already subscribed')
      }

      let user = await userService.getUser(address)
      if (!user) {
        user = await userService.createUser(address)
      }

      await subscriptionService.subscribe(
        user,
        eventName,
        webhookUrl
      )

      res.json({ message: 'Successfully subscribed to event' })
    } catch (e) {
      next(e)
    }
  }

  static async unsubscribe (req: Request, res: Response, next: NextFunction) {
    try {
      const { eventName } = req.params
      const { address } = req.body

      const userService = Container.get(UserService)
      const subscriptionService = Container.get(SubscriptionService)

      const user = await userService.getUser(address)
      if (!user) {
        throw new RequestError(400, 'User not found')
      }

      await subscriptionService.unsubscribe(user, eventName)

      res.json({ message: 'Successfully unsubscribed from event' })
    } catch (e) {
      next(e)
    }
  }

  static async filterStatus (req: Request, res: Response, next: NextFunction) {
    try {
      const { filterType } = req.params

      if (filterType === 'event' || filterType === 'transaction') {
        const filterStatus = await FilterStatus.findOne({ filter: filterType })
        res.json({ filter: filterStatus?.filter, blockNumber: filterStatus?.blockNumber })
      } else {
        throw new RequestError(400, 'Unsupported filter type')
      }
    } catch (e) {
      next(e)
    }
  }
}
