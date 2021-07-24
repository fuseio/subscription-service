import { Service } from 'typedi'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import ITransactionFilter from '../filters/transaction/ITransactionFilter'
import nativeTransferToTransactionFilter from '../filters/transaction/nativeTransferToTransactionFilter'
import ProviderService from './provider'
import SubscriptionService from './subscription'
import BroadcastService from './broadcast/httpBroadcast'
import { TRANSFER_TO_EVENT } from '@constants/events'
import BlockTracker from '@models/BlockTracker'
import { parseTransaction } from '@utils/index'

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

    console.log(`TransactionFilter: Processing blocks from ${fromBlock} to ${toBlock}`)

    for (let i = fromBlock; i <= toBlock; i++) {
      await this.processBlock(i)
    }
  }

  async processBlock (blockNumber: number) {
    const block = await this.provider.getBlockWithTransactions(blockNumber)

    // TODO: maybe just run all filters on transaction and return transactions
    for (const transactionFilter of this.transactionFilters) {
      const filtered = block.transactions.filter(transactionFilter.filter)

      for (const transaction of filtered) {
        await this.processTransaction(transaction, transactionFilter)
      }
    }

    const blockTracker = await this.getBlockTracker()
    await blockTracker.update({ block: block.number })

    console.log(`TransactionFilter: Processed block ${block.number}`)
  }

  // TODO: maybe we can just pass on the transaction regardless of filter type
  async processTransaction (transaction: TransactionResponse, filter: any) {
    const parsedTransaction = parseTransaction(transaction)

    if (filter.type === nativeTransferToTransactionFilter.type) {
      await this.processNativeTransfer(parsedTransaction)
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
        await this.broadcastService.broadcast(
          userSubscription,
          transaction
        )
      }
    } catch (e) {
      console.log('Failed to process native transfer', e)
    }
  }

  async getBlockTracker () {
    const blockTracker = await BlockTracker.findOne({ filter: 'transaction' })
    if (blockTracker) {
      return blockTracker
    } else {
      const newBlockTracker = await BlockTracker.create({ filter: 'transaction' })
      return newBlockTracker
    }
  }
}
