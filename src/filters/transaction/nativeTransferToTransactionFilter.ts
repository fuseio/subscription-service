import ITransactionFilter from './ITransactionFilter'

const filter: ITransactionFilter = {
  type: 'nativeTransferTo',
  filter (transaction) {
    return transaction.value.gt(0)
  }
}

export default filter
