import { Service } from 'typedi'
import { Log } from '@ethersproject/providers'
import ProviderService from './provider'
import { TRANSFER_TO_EVENT } from '@constants/events'
import SubscriptionService from './subscription'
import erc20TransferToFilter from '../filters/event/erc20TransferFilter'
import BroadcastService from './broadcast/httpBroadcast'
import { parseLog } from '@utils/index'
import IEventFilter from 'filters/event/IEventFilter'
import FilterStatusService from './filterStatus'
import logPerformance from '../decorators/logPerformance'

@Service()
export default class EventFilterService {
  eventfilters: Array<any> = []

  constructor (
      private readonly providerService: ProviderService,
      private readonly subscriptionService: SubscriptionService,
      private readonly broadcastService: BroadcastService,
      private readonly filterStatusService: FilterStatusService
  ) {}

  get provider () {
    return this.providerService.getProvider()
  }

  init () {
    this.eventfilters.push(erc20TransferToFilter)

    this.start()
  }

  async start () {
    while (true) {
      const { number: toBlockNumber } = await this.provider.getBlock('latest')

      const filterStatus = await this.filterStatusService.getFilterStatus('event')
      const fromBlockNumber = filterStatus.blockNumber
        ? filterStatus.blockNumber + 1
        : toBlockNumber

      await this.processBlocks(
        fromBlockNumber,
        toBlockNumber
      )
    }
  }

  async processBlocks (fromBlock: number, toBlock: number) {
    if (fromBlock > toBlock) return

    console.log(`EventFilter: Processing blocks from ${fromBlock} to ${toBlock}`)

    for (let i = fromBlock; i <= toBlock; i++) {
      await this.processBlock(i)
    }
  }

  @logPerformance('EventFilter::ProcessBlock')
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

    await this.filterStatusService.updateBlockNumber('event', blockNumber)

    console.log(`EventFilter: Processed block ${blockNumber}`)
  }

  async processEvent (log: Log, filter: IEventFilter) {
    if (filter.name === erc20TransferToFilter.name) {
      await this.processErc20TransferEvent(log, filter)
    }
  }

  async processErc20TransferEvent (log: Log, filter: IEventFilter) {
    const parsedLog = parseLog(log, filter.abi)
    const toAddress = parsedLog.args[1]
    const fromAddress = parsedLog.args[0]

    const isToSubscribed = await this.subscriptionService.isSubscribed(filter.event, toAddress)
    if (!isToSubscribed) {
      return
    }

    const userSubscription = await this.subscriptionService.getSubscription(
      filter.event,
      toAddress
    )

    const isFromSubscribed = await this.subscriptionService.isSubscribed(filter.event, fromAddress)
    const subscribers = {
      to: toAddress,
      ...(isFromSubscribed && { from: fromAddress })
    }

    const data = {
      to: parsedLog.args[1],
      from: parsedLog.args[0],
      value: parsedLog.args[2],
      txHash: parsedLog.transactionHash,
      address: parsedLog.address,
      subscribers
    }

    if (userSubscription) {
      console.log(`Sending data to webhook, event: ${TRANSFER_TO_EVENT} address: ${toAddress}`)

      await this.broadcastService.broadcast(
        userSubscription,
        data
      )
    }
  }
}
