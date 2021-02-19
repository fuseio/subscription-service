import { Request, Response, NextFunction } from 'express'
import Container from 'typedi'
import SubscriptionService from '../../../../services/subscription'
import { WALLET_TRANSFER_TO_EVENT } from '../../../../constants/events'
import UserService from '../../../../services/user'
import UserSubscriptionService from '../../../../services/userSubscription'
import RequestError from '../../../../models/RequestError'
import { validationResult } from 'express-validator'

export default class SubscriptionsController {
  static async subscribeWalletTransfersTo (req: Request, res: Response, next: NextFunction) {
    try {
      const {
        address,
        webhookUrl
      } = req.body

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.mapped() })
        return
      }

      const userService = Container.get(UserService)
      const userSubscriptionService = Container.get(UserSubscriptionService)
      const subscriptionService = Container.get(SubscriptionService)

      let user = await userService.getUser(address)
      if (!user) {
        user = await userService.createUser(address)
      }

      const hasSubscription = await userSubscriptionService.hasSubscription(
        WALLET_TRANSFER_TO_EVENT,
        user
      )

      if (hasSubscription) {
        throw new RequestError(400, 'User already subscribed')
      }

      await userSubscriptionService.createSubscription(
        WALLET_TRANSFER_TO_EVENT,
        webhookUrl,
        user
      )

      subscriptionService.subscribe(
        WALLET_TRANSFER_TO_EVENT,
        address
      )

      res.json({ message: 'Successfully subscribed to event' })
    } catch (e) {
      next(e)
    }
  }

  static async unsubscribeWalletTransferTo (req: Request, res: Response, next: NextFunction) {
    try {
      const {
        address
      } = req.body

      const userService = Container.get(UserService)
      const userSubscriptionService = Container.get(UserSubscriptionService)
      const subscriptionService = Container.get(SubscriptionService)

      const user = await userService.getUser(address)
      if (!user) {
        throw new RequestError(400, 'User not found')
      }

      await userSubscriptionService.removeSubscription(
        WALLET_TRANSFER_TO_EVENT,
        user
      )

      subscriptionService.unsubscribe(
        WALLET_TRANSFER_TO_EVENT,
        address
      )

      res.json({ message: 'Successfully unsubscribed from event' })
    } catch (e) {
      next(e)
    }
  }
}
