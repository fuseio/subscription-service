import { Service } from 'typedi'
import config from 'config'
import { Log } from '@ethersproject/providers'
import ProviderService from './provider'
import { TRANSFER_TO_EVENT } from '@constants/events'
import SubscriptionService from './subscription'
import erc20TransferToFilter from '../filters/event/erc20TransferFilter'
import BroadcastService from './broadcast/httpBroadcast'
import { getTokenTypeAbi, getTransferEventTokenType, parseLog, sleep, TokenType } from '@utils/index'
import IEventFilter from '../filters/event/IEventFilter'
import FilterStatusService from './filterStatus'
import logPerformance from '../decorators/logPerformance'
import Sentry from '@services/errors/sentry'
import ERC20_ABI from '@constants/abi/erc20.json'
import ERC721_ABI from '@constants/abi/erc721.json'

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
      try {
        const { number: toBlockNumber } = await this.provider.getBlock('latest')

        const filterStatus = await this.filterStatusService.getFilterStatus('event')
        const fromBlockNumber = filterStatus.blockNumber
          ? filterStatus.blockNumber + 1
          : toBlockNumber

        if (fromBlockNumber >= toBlockNumber) {
          const timeout: number = config.get('timeoutInterval')
          console.log(`Sleeping for ${timeout}`);
          
          await sleep(timeout)
        }

        await this.processBlocks(
          fromBlockNumber,
          toBlockNumber
        )
      } catch (error) {
        console.log('Failed to process blocks:')
        console.error(error)

        Sentry.captureException(error, {
          tags: {
            filterType: 'EventFilter'
          }
        })
      }
    }
  }

  @logPerformance('EventFilter::ProcessBlocks')
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
        try {
          await this.processEvent(log, eventFilter)
        } catch (error) {
          console.error('Failed to process log:')
          console.error({ log })
          console.error(error)

          Sentry.setContext('log', log)
          Sentry.captureException(error, {
            tags: {
              filterType: 'EventFilter'
            }
          })
        }
      }
    }

    await this.filterStatusService.updateBlockNumber('event', blockNumber)

    console.log(`EventFilter: Processed block ${blockNumber}`)
  }

  @logPerformance('EventFilter::ProcessEvent')
  async processEvent (log: Log, filter: IEventFilter) {
    if (filter.name === erc20TransferToFilter.name) {
      await this.processErc20TransferEvent(log, filter)
    }
  }

  @logPerformance('EventFilter::ProcessErc20TransferEvent')
  async processErc20TransferEvent (log: Log, filter: IEventFilter) {
    const tokenType = getTransferEventTokenType(log)
    const abi = getTokenTypeAbi(tokenType)

    const parsedLog = parseLog(log, abi)
    const fromAddress = parsedLog.args[0]
    const toAddress = parsedLog.args[1]

    const isToSubscribed = await this.subscriptionService.isSubscribed(filter.event, toAddress)
    if (!isToSubscribed) {
      return
    }

    const userSubscription = await this.subscriptionService.getSubscription(
      filter.event,
      toAddress
    )

    const isFromSubscribed = await this.subscriptionService.isSubscribed(filter.event, fromAddress)
    const subscribers = [toAddress]
    if (isFromSubscribed) {
      subscribers.push(fromAddress)
    }

    const data = {
      to: parsedLog.args[1],
      from: parsedLog.args[0],
      value: parsedLog.args[2].toString(),
      txHash: parsedLog.transactionHash,
      address: parsedLog.address,
      blockNumber: log.blockNumber,
      blockHash: log.blockHash,
      tokenType: tokenType?.valueOf(),
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
