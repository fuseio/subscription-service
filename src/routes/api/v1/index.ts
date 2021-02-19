import { Router } from 'express'
import SubscriptionsController from '../../../controllers/api/v1/subscriptions'
import {
  subscribeWalletTransfersToValidation,
  unsubscribeWalletTransfersToValidation
} from '../../../controllers/api/v1/subscriptions/validations'

const router = Router()

router.post(
  '/subscribe/wallet/transfers-to',
  subscribeWalletTransfersToValidation,
  SubscriptionsController.subscribeWalletTransfersTo
)

router.post(
  '/unsubscribe/wallet/transfers-to',
  unsubscribeWalletTransfersToValidation,
  SubscriptionsController.unsubscribeWalletTransferTo
)

export default router
