import EventEmitter from 'events'
import { Service } from 'typedi'
import { Interface } from '@ethersproject/abi'
import Axios, { AxiosRequestConfig } from 'axios'
import config from 'config'
import ProviderService from './provider'
import ERC20_ABI from '@constants/abi/erc20.json'
import { ERC20_TRANSFER_EVENT_HASH, ERC20_TRANSFER_TO_EVENT } from '@constants/events'
import SubscriptionService from './subscription'
import { isStudioUrl } from '@utils/index'

interface Log {
  topics: Array<string>;
  data: string;
  address: string;
  transactionHash: string;
}

@Service()
export default class EventService {
    readonly eventManager: EventEmitter

    constructor (
      private readonly providerService: ProviderService,
      private readonly subscriptionService: SubscriptionService) {
      this.eventManager = new EventEmitter()
    }

    get provider () {
      return this.providerService.getProvider()
    }

    addEvents () {
      this.addErc20TransferToEvent()
    }

    addErc20TransferToEvent () {
      const handler = async (log: Log) => {
        const erc20Interface = new Interface(ERC20_ABI)
        const data = erc20Interface.parseLog(log)
        const { args: [, to] } = data

        const result = {
          address: log?.address,
          transactionHash: log?.transactionHash,
          name: data?.name,
          signature: data?.signature,
          topic: data?.topic,
          args: data?.args
        }

        const isSubscribed = await this.subscriptionService
          .isSubscribed(ERC20_TRANSFER_TO_EVENT, to)

        if (isSubscribed) {
          this.eventManager.emit(ERC20_TRANSFER_TO_EVENT, result, to)
        }
      }

      this.provider.on([ERC20_TRANSFER_EVENT_HASH], handler)
    }

    addHandlers () {
      this.addErc20TransferToHandler()
    }

    addErc20TransferToHandler () {
      this.eventManager.on(ERC20_TRANSFER_TO_EVENT, async (data, to) => {
        let webhookUrl

        try {
          const subscription = await this.subscriptionService
            .getSubscription(ERC20_TRANSFER_TO_EVENT, to)
          webhookUrl = subscription?.webhookUrl

          console.log(`Sending data to webhook, event: ${ERC20_TRANSFER_TO_EVENT} address: ${to}`)

          if (subscription?.webhookUrl) {
            const requestConfig: AxiosRequestConfig = {}

            if (isStudioUrl(subscription.webhookUrl)) {
              const jwt: string = config.get('studio.jwt')
              requestConfig.headers = {
                Authorization: `Bearer ${jwt}`
              }
            }

            await Axios.post(subscription.webhookUrl, data, requestConfig)
          }
        } catch (e) {
          console.error(`Failed to send data to webhookUrl: ${webhookUrl}`)
        }
      })
    }
}
