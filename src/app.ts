import 'reflect-metadata'
import 'module-alias/register'
import 'express-async-errors'
import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import util from 'util'
import config from 'config'

import routes from './routes'
import RequestError from '@models/RequestError'
import { isProduction } from './utils'

console.log(util.inspect(config, { depth: null }))

const app = express()

app.use(morgan('common'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(routes)

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  const err = new RequestError(404, 'Not Found')
  next(err)
})

/// error handlers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(function (err: RequestError, req: Request, res: Response, next: NextFunction) {
  if (!isProduction) console.log(err.stack)

  res.status(err.status || 500)

  res.json({
    errors: {
      message: err.message,
      error: err
    }
  })
})

export default app
