import { Service } from 'typedi'
import { Log } from '@ethersproject/providers'
import ProviderService from './provider'
import { TRANSFER_TO_EVENT } from '@constants/events'
import SubscriptionService from './subscription'
import erc20TransferToFilter from '../filters/event/erc20TransferFilter'
import EventFilter from '../models/EventFilter'
import BroadcastService from './broadcast'
import { parseLog } from '@utils/index'
import IEventFilter from 'filters/event/IEventFilter'

@Service()
export default class EventService {
  eventfilters: Array<any> = []

  constructor (
      private readonly providerService: ProviderService,
      private readonly subscriptionService: SubscriptionService,
      private readonly broadcastService: BroadcastService
  ) {}

  get provider () {
    return this.providerService.getProvider()
  }

  init () {
    this.eventfilters.push(erc20TransferToFilter)

    this.provider.on('block', this.processEventsInBlock.bind(this))
  }

  private processEventsInBlock (block: number) {
    this.eventfilters.forEach((filter) => this.processEventsForFilter(block, filter))
  }

  private async processEventsForFilter (latestBlock: number, eventFilter: IEventFilter) {
    const eventFilterModel = await EventFilter.findOneAndUpdate(
      { type: eventFilter.type },
      { type: eventFilter.type, lastSyncedBlock: latestBlock },
      { upsert: true }
    )

    const logs = await this.provider.getLogs({
      ...eventFilter.filter,
      fromBlock: eventFilterModel?.lastSyncedBlock || latestBlock,
      toBlock: latestBlock
    })

    for (const log of logs) {
      await this.processEvent(log, eventFilter)
    }

    await eventFilterModel?.update({ lastSyncedBlock: latestBlock })
  }

  async processEvent (log: Log, eventFilter: IEventFilter) {
    const data = parseLog(log, eventFilter.abi)

    if (eventFilter.type === erc20TransferToFilter.type) {
      await this.processErc20TransferEvent(data)
    }
  }

  async processErc20TransferEvent (data: any) {
    try {
      const toAddress = data.args[1]
      const userSubscription = await this.subscriptionService.getSubscription(
        TRANSFER_TO_EVENT,
        toAddress
      )

      if (userSubscription) {
        console.log(`Sending data to webhook, event: ${TRANSFER_TO_EVENT} address: ${toAddress}`)

        await this.broadcastService.broadcastContractEvent(
          userSubscription,
          data
        )
      }
    } catch (e) {
      console.error('Failed to send data to webhookUrl')
    }
  }
}
