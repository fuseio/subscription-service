import { Service } from 'typedi'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import ITransactionFilter from '../filters/transaction/ITransactionFilter'
import nativeTransferTransactionFilter from '../filters/transaction/nativeTransferTransactionFilter'
import ProviderService from './provider'
import SubscriptionService from './subscription'
import BroadcastService from './broadcast/httpBroadcast'
import FilterStatusService from './filterStatus'
import logPerformance from '../decorators/logPerformance'

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
      const { number: toBlockNumber } = await this.provider.getBlock('latest')

      const filterStatus = await this.filterStatusService.getFilterStatus('transaction')
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

    console.log(`TransactionFilter: Processing blocks from ${fromBlock} to ${toBlock}`)

    for (let i = fromBlock; i <= toBlock; i++) {
      await this.processBlock(i)
    }
  }

  @logPerformance('TransactionFilter::ProcessBlock')
  async processBlock (blockNumber: number) {
    const block = await this.provider.getBlockWithTransactions(blockNumber)

    for (const transactionFilter of this.transactionFilters) {
      const filtered = block.transactions.filter(transactionFilter.filter)

      for (const transaction of filtered) {
        await this.processTransaction(transaction, transactionFilter)
      }
    }

    await this.filterStatusService.updateBlockNumber('transaction', block.number)

    console.log(`TransactionFilter: Processed block ${block.number}`)
  }

  async processTransaction (transaction: TransactionResponse, filter: ITransactionFilter) {
    if (filter.name === nativeTransferTransactionFilter.name) {
      await this.processNativeTransferEvent(transaction, filter)
    }
  }

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
    const subscribers = {
      to: transaction.to,
      ...(isFromSubscribed && { from: transaction.from })
    }

    const data = {
      to: transaction.to,
      from: transaction.from,
      value: transaction.value,
      txHash: transaction.hash,
      subscribers
    }

    if (userSubscription) {
      await this.broadcastService.broadcast(
        userSubscription,
        data
      )
    }
  }
}
