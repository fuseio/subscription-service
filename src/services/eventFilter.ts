import { Service } from 'typedi'
import { Log } from '@ethersproject/providers'
import ProviderService from './provider'
import { TRANSFER_TO_EVENT } from '@constants/events'
import SubscriptionService from './subscription'
import erc20TransferToFilter from '../filters/event/erc20TransferFilter'
import BroadcastService from './broadcast'
import { parseLog } from '@utils/index'
import IEventFilter from 'filters/event/IEventFilter'
import BlockTracker from '@models/BlockTracker'

@Service()
export default class EventFilterService {
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

    this.start()
  }

  async start () {
    const latestBlock = await this.provider.getBlock('latest')
    const blockTracker = await this.getBlockTracker()

    await this.processBlocks(
      blockTracker.block + 1 || latestBlock.number,
      latestBlock.number
    )

    this.start()
  }

  async processBlocks (fromBlock: number, toBlock: number) {
    if (fromBlock > toBlock) return

    console.log(`EventFilter: Processing blocks from ${fromBlock} to ${toBlock}`)

    for (let i = fromBlock; i <= toBlock; i++) {
      await this.processBlock(i)
    }
  }

  async processBlock (blockNumber: number) {
    for (const eventFilter of this.eventfilters) {
      const logs = await this.provider.getLogs({
        ...eventFilter.filter,
        fromBlock: blockNumber,
        toBlock: blockNumber
      })

      for (const log of logs) {
        await this.processEvent(log, eventFilter)
      }
    }

    const blockTracker = await this.getBlockTracker()
    await blockTracker.update({ block: blockNumber })

    console.log(`EventFilter: Processed block ${blockNumber}`)
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

  async getBlockTracker () {
    const blockTracker = await BlockTracker.findOne({ filter: 'event' })
    if (blockTracker) {
      return blockTracker
    } else {
      const newBlockTracker = await BlockTracker.create({ filter: 'event' })
      return newBlockTracker
    }
  }
}
