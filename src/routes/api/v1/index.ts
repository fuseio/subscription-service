import { Router } from 'express'
import SubscriptionsController from '@controllers/api/v1/subscriptions'
import {
  subscribeValidation,
  unsubscribeValidation
} from '@controllers/api/v1/subscriptions/validations'

const router = Router()

router.post(
  '/subscribe/:eventName',
  subscribeValidation,
  SubscriptionsController.subscribe
)

router.post(
  '/unsubscribe/:eventName',
  unsubscribeValidation,
  SubscriptionsController.unsubscribe
)

export default router
