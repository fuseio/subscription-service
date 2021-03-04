import { Router } from 'express'
import SubscriptionsController from '@controllers/api/v1/subscriptions'
import {
  unsubscribeValidationHandler,
  subscribeValidationHandler
} from '@controllers/api/v1/subscriptions/validations'

const router = Router()

router.post(
  '/subscribe/:eventName',
  subscribeValidationHandler,
  SubscriptionsController.subscribe
)

router.post(
  '/unsubscribe/:eventName',
  unsubscribeValidationHandler,
  SubscriptionsController.unsubscribe
)

export default router
