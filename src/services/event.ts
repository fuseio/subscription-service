import EventEmitter from 'events'
import { Service } from 'typedi'
import { Interface } from '@ethersproject/abi'
import ProviderService from './provider'
import ERC20_ABI from '../constants/abi/erc20.json'
import { ERC20_TRANSFER_EVENT_HASH, WALLET_TRANSFER_TO_EVENT } from '../constants/events'
import SubscriptionService from './subscription'
import UserSubscriptionService from './userSubscription'
import axios from 'axios'

interface Log { topics: Array<string>, data: string}

@Service()
export default class EventService {
    readonly eventManager: EventEmitter

    constructor (
      private readonly providerService: ProviderService,
      private readonly subscriptionService: SubscriptionService,
      private readonly userSubscriptionService: UserSubscriptionService) {
      this.eventManager = new EventEmitter()
    }

    get provider () {
      return this.providerService.getProvider()
    }

    addEvents () {
      this.addWalletTransferToEvent()
    }

    addWalletTransferToEvent () {
      const handler = (log: Log) => {
        const erc20Interface = new Interface(ERC20_ABI)
        const data = erc20Interface.parseLog(log)
        const { args: [, to] } = data

        if (this.subscriptionService.isSubscribed(WALLET_TRANSFER_TO_EVENT, to)) {
          this.eventManager.emit(WALLET_TRANSFER_TO_EVENT, data, to)
        }
      }

      this.provider.on([ERC20_TRANSFER_EVENT_HASH], handler)
    }

    addHandlers () {
      this.addWalletTransferToHandler()
    }

    addWalletTransferToHandler () {
      this.eventManager.on(WALLET_TRANSFER_TO_EVENT, async (data, to) => {
        try {
          const subscription: any = await this.userSubscriptionService
            .getSubscription(
              WALLET_TRANSFER_TO_EVENT,
              to
            )

          if (subscription && subscription.webhookUrl) {
            await axios.post(subscription.webhookUrl, data)
          }
        } catch (e) {
          console.error(e)
        }
      })
    }
}
