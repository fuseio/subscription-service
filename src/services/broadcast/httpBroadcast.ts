import Axios, { AxiosRequestConfig } from 'axios'
import config from 'config'
import { Service } from 'typedi'
import { isStudioUrl } from '@utils/index'
import { UserSubscriptionDoc } from '@models/UserSubscription'
import IBroadcast from './IBroadcast'

@Service()
export default class HttpBroadcastService implements IBroadcast {
  async broadcast (subscription: UserSubscriptionDoc, data: any) {
    if (subscription) {
      const axiosConfig = isStudioUrl(subscription.webhookUrl)
        ? this.buildJwtRequestConfig()
        : {}
      try {
        const response = await Axios.post(subscription.webhookUrl, data, axiosConfig)
        return response
      } catch (err) {
        console.error(err)
      }
    }
  }

  private buildJwtRequestConfig () {
    const requestConfig: AxiosRequestConfig = {}

    const jwt: string = config.get('studio.jwt')
    requestConfig.headers = {
      Authorization: `Bearer ${jwt}`
    }

    return requestConfig
  }
}
