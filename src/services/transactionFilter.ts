import { Service } from 'typedi'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import config from 'config'
import ITransactionFilter from '../filters/transaction/ITransactionFilter'
import nativeTransferTransactionFilter from '../filters/transaction/nativeTransferTransactionFilter'
import ProviderService from './provider'
import SubscriptionService from './subscription'
import BroadcastService from './broadcast/httpBroadcast'
import FilterStatusService from './filterStatus'
import logPerformance from '../decorators/logPerformance'
import { NATIVE_FUSE_ADDRESS, sleep, TokenType } from '@utils/index'
import Sentry from '@services/errors/sentry'

@Service()
export default class TransactionFilterService {
  transactionFilters: Array<ITransactionFilter> = []

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
    this.transactionFilters.push(nativeTransferTransactionFilter)

    this.start()
  }

  async start () {
    while (true) {
      try {
        const { number: toBlockNumber } = await this.provider.getBlock('latest')

        const filterStatus = await this.filterStatusService.getFilterStatus('transaction')
        const fromBlockNumber = filterStatus.blockNumber
          ? filterStatus.blockNumber + 1
          : toBlockNumber

        if (fromBlockNumber >= toBlockNumber) {
          const timeout: number = config.get('timeoutInterval')
          await sleep(timeout)
        }

        await this.processBlocks(
          fromBlockNumber,
          toBlockNumber
        )
      } catch (error) {
        console.error('Failed to process blocks:')
        console.error(error)

        Sentry.captureException(error, {
          tags: {
            filterType: 'TransactionFilter'
          }
        })
      }
    }
  }

  @logPerformance('TransactionFilter::ProcessBlocks')
  async processBlocks (fromBlock: number, toBlock: number) {
    if (fromBlock > toBlock) return

    console.log(`TransactionFilter: Processing blocks from ${fromBlock} to ${toBlock}`)

    for (let i = fromBlock; i <= toBlock; i++) {
      await this.processBlock(i)
    }
  }

  @logPerformance('TransactionFilter::ProcessBlock')
  async processBlock (blockNumber: number) {
    const block = await this.getBlockWithTransactions(blockNumber)

    for (const transactionFilter of this.transactionFilters) {            
      const filtered = block.transactions.filter(transactionFilter.filter)

      for (const transaction of filtered) {
        try {
          await this.processTransaction(transaction, transactionFilter)
        } catch (error) {
          console.error('Failed to process transaction:')
          console.error({ transaction })
          console.error(error)

          Sentry.setContext('transaction', transaction)
          Sentry.captureException(error, {
            tags: {
              filterType: 'TransactionFilter'
            }
          })
        }
      }
    }

    await this.filterStatusService.updateBlockNumber('transaction', block.number)

    console.log(`TransactionFilter: Processed block ${block.number}`)
  }

  @logPerformance('TransactionFilter::GetBlockWithTransactions')
  private async getBlockWithTransactions(blockNumber: number) {
    return await this.provider.getBlockWithTransactions(blockNumber)
  }

  @logPerformance('TransactionFilter::ProcessTransaction')
  async processTransaction (transaction: TransactionResponse, filter: ITransactionFilter) {
    if (filter.name === nativeTransferTransactionFilter.name) {
      await this.processNativeTransferEvent(transaction, filter)
    }
  }

  @logPerformance('TransactionFilter::ProcessNativeTransferEvent')
  async processNativeTransferEvent (transaction: TransactionResponse, filter: ITransactionFilter) {
    const isToSubscribed = await this.subscriptionService.isSubscribed(filter.event, transaction.to)
    if (!isToSubscribed) {
      return
    }

    const userSubscription = await this.subscriptionService.getSubscription(
      filter.event,
      transaction.to
    )

    const isFromSubscribed = await this.subscriptionService.isSubscribed(filter.event, transaction.from)
    const subscribers = [transaction.to]
    if (isFromSubscribed) {
      subscribers.push(transaction.from)
    }

    const data = {
      to: transaction.to,
      from: transaction.from,
      value: transaction.value.toString(),
      txHash: transaction.hash,
      blockNumber: transaction.blockNumber,
      blockHash: transaction.blockHash,
      subscribers,
      tokenType: TokenType.Native,
      address: NATIVE_FUSE_ADDRESS
    }

    if (userSubscription) {
      await this.broadcastService.broadcast(
        userSubscription,
        data
      )
    }
  }
}
