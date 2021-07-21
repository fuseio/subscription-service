import { Service } from 'typedi'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import ITransactionFilter from '../filters/transaction/ITransactionFilter'
import nativeTransferToTransactionFilter from '../filters/transaction/nativeTransferToTransactionFilter'
import ProviderService from './provider'
import SubscriptionService from './subscription'
import BroadcastService from './broadcast'
import { TRANSFER_TO_EVENT } from '@constants/events'
import TransactionFilterModel from '@models/TransactionFilter'

@Service()
export default class TransactionFilterService {
  transactionFilters: Array<ITransactionFilter> = []

  constructor (
    private readonly providerService: ProviderService,
    private readonly subscriptionService: SubscriptionService,
    private readonly broadcastService: BroadcastService
  ) {}

  get provider () {
    return this.providerService.getProvider()
  }

  init () {
    this.transactionFilters.push(nativeTransferToTransactionFilter)

    // before we start listening

    this.provider.on('block', this.processTransactionsInBlock.bind(this))
  }

  async processTransactionsInBlock (blockNumber: number) {
    this.transactionFilters.forEach(filter => this.processTransactionsForFilter(blockNumber, filter))
  }

  async processTransactionsForFilter (blockNumber: number, transactionFilter: ITransactionFilter) {
    const transactionFilterModel = await TransactionFilterModel.findOneAndUpdate(
      { type: transactionFilter.type },
      { type: transactionFilter.type, lastSyncedBlock: blockNumber },
      { upsert: true }
    )
    if (!transactionFilterModel) return

    const transactions = await this.fetchTransactions(transactionFilterModel?.lastSyncedBlock, blockNumber)
    const filteredTransactions = transactions.filter(transactionFilter.filter)

    for (const transaction of filteredTransactions) {
      await this.processTransaction(transaction, transactionFilter)
    }

    await transactionFilterModel.update({ lastSyncedBlock: blockNumber })
  }

  async fetchTransactions (fromBlock: number, toBlock: number) {
    const transactions = []

    for (let i = fromBlock; i <= toBlock; i++) {
      const transactionsFromBlock = await this.provider.getBlockWithTransactions(i)
      transactions.push(...transactionsFromBlock.transactions)
    }

    return transactions
  }

  async processTransaction (transaction: TransactionResponse, filter: any) {
    if (filter.type === nativeTransferToTransactionFilter.type) {
      await this.processNativeTransfer(transaction)
    }
  }

  async processNativeTransfer (transaction: TransactionResponse) {
    try {
      const toAddress = transaction.to
      if (!toAddress) return

      const userSubscription = await this.subscriptionService.getSubscription(
        TRANSFER_TO_EVENT,
        toAddress
      )

      if (userSubscription) {
        await this.broadcastService.broadcastTransaction(
          userSubscription,
          transaction
        )
      }
    } catch (e) {
      console.log('Failed to process native transfer', e)
    }
  }
}
