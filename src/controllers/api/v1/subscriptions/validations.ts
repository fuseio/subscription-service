import { body } from 'express-validator'

export const subscribeWalletTransfersToValidation = [
  body('address').exists().isString().isEthereumAddress(),
  body('webhookUrl').exists().isString()
]

export const unsubscribeWalletTransfersToValidation = [
  body('address').exists().isString().isEthereumAddress()
]
