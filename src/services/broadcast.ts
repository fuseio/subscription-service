import Axios, { AxiosRequestConfig } from 'axios'
import config from 'config'
import { Service } from 'typedi'
import { isStudioUrl } from '@utils/index'
import { UserSubscriptionDoc } from '@models/UserSubscription'

@Service()
export default class BroadcastService {
  async broadcastContractEvent (subscription: UserSubscriptionDoc, eventData: any) {
    if (!subscription) return

    const requestConfig = isStudioUrl(subscription.webhookUrl) ? this.buildJwtRequestConfig() : {}

    return Axios.post(subscription.webhookUrl, eventData, requestConfig)
  }

  async broadcastTransaction (subscription: UserSubscriptionDoc, transactionData: any) {
    if (!subscription) return

    const requestConfig = isStudioUrl(subscription.webhookUrl) ? this.buildJwtRequestConfig() : {}

    return Axios.post(subscription.webhookUrl, transactionData, requestConfig)
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
