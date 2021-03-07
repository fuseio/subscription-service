import { SUPPORTED_EVENTS } from '@constants/events'
import { NextFunction, Request, Response } from 'express'
import { body, param, ValidationChain, validationResult } from 'express-validator'

const supportedEventValidator = (value: string) => {
  if (!SUPPORTED_EVENTS.includes(value)) {
    throw new Error(`Event ${value} not supported`)
  }
  return true
}

const subscribeValidations = [
  body('address').exists().isString().isEthereumAddress(),
  param('eventName').exists().isString().custom(supportedEventValidator),
  body('webhookUrl').exists().isString()
]

const unsubscribeValidations = [
  body('address').exists().isString().isEthereumAddress(),
  param('eventName').exists().isString().custom(supportedEventValidator)
]

const handleValidations = async (
  validations: Array<ValidationChain>,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await Promise.all(validations.map(
    validation => validation.run(req))
  )

  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }

  res.status(400).json({ error: errors.mapped() })
}

export const subscribeValidationHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  handleValidations(subscribeValidations, req, res, next)
}

export const unsubscribeValidationHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  handleValidations(unsubscribeValidations, req, res, next)
}
