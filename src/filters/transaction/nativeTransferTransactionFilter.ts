import { TRANSFER_TO_EVENT } from '@constants/events'
import ITransactionFilter from './ITransactionFilter'

const filter: ITransactionFilter = {
  name: 'nativeTransfer',
  type: 'transactionFilter',
  event: TRANSFER_TO_EVENT,
  filter (transaction) {
    return transaction.value.gt(0)
  }
}

export default filter
