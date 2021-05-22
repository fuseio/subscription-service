import axios, { AxiosInstance } from 'axios'
import jwt from 'jsonwebtoken'
import config from 'config'

export const isProduction = process.env.NODE_ENV === 'production'

export const createHttpClientWithJwt = (signedJwt: string): AxiosInstance =>
  axios.create({
    headers: {
      Authorization: `Bearer ${signedJwt}`
    }
  })

export const signJwt = (data: any): string => {
  const secret: string = config.get('api.secret')
  const expiresIn: string = config.get('api.tokenExpiresIn')
  return jwt.sign(data, secret, { expiresIn })
}
