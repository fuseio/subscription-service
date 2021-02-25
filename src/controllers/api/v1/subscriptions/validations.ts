import { body } from 'express-validator'

export const subscribeValidation = [
  body('address').exists().isString().isEthereumAddress(),
  body('webhookUrl').exists().isString()
]

export const unsubscribeValidation = [
  body('address').exists().isString().isEthereumAddress()
]
