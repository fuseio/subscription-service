import jwt from 'express-jwt'
import config from 'config'

const secret: string = config.get('api.secret')

const auth = {
  required: jwt({
    secret: secret,
    credentialsRequired: true,
    algorithms: ['HS256']
  }),
  optional: jwt({
    secret: secret,
    credentialsRequired: false,
    algorithms: ['HS256']
  })
}

export default auth
