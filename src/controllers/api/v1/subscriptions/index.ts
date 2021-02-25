import { Request, Response, NextFunction } from 'express'
import Container from 'typedi'
import SubscriptionService from '@services/subscription'
import { SUPPORTED_EVENTS, ERC20_TRANSFER_TO_EVENT } from '@constants/events'
import UserRepoService from '@services/userRepo'
import UserSubscriptionRepoService from '@services/userSubscriptionRepo'
import RequestError from '@models/RequestError'
import { validationResult } from 'express-validator'

export default class SubscriptionsController {
  static async subscribe (req: Request, res: Response, next: NextFunction) {
    try {
      const { eventName } = req.params
      const { address, webhookUrl } = req.body

      if (!SUPPORTED_EVENTS.includes(eventName)) {
        res.status(400).json({ message: 'Unsupported event' })
        return
      }

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.mapped() })
        return
      }

      const userRepo = Container.get(UserRepoService)
      const userSubscriptionRepo = Container.get(UserSubscriptionRepoService)
      const subscription = Container.get(SubscriptionService)

      let user = await userRepo.getUser(address)
      if (!user) {
        user = await userRepo.createUser(address)
      }

      const hasSubscription = await userSubscriptionRepo.hasSubscription(
        eventName,
        user
      )

      if (hasSubscription) {
        throw new RequestError(400, 'User already subscribed')
      }

      await userSubscriptionRepo.createSubscription(
        eventName,
        webhookUrl,
        user
      )

      subscription.subscribe(
        eventName,
        address
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

      if (!SUPPORTED_EVENTS.includes(eventName)) {
        res.status(400).json({ message: 'Unsupported event' })
        return
      }

      const userRepo = Container.get(UserRepoService)
      const userSubscriptionRepo = Container.get(UserSubscriptionRepoService)
      const subscription = Container.get(SubscriptionService)

      const user = await userRepo.getUser(address)
      if (!user) {
        throw new RequestError(400, 'User not found')
      }

      await userSubscriptionRepo.removeSubscription(
        ERC20_TRANSFER_TO_EVENT,
        user
      )

      subscription.unsubscribe(
        ERC20_TRANSFER_TO_EVENT,
        address
      )

      res.json({ message: 'Successfully unsubscribed from event' })
    } catch (e) {
      next(e)
    }
  }
}
