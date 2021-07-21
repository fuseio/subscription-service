import ABI from '../../constants/abi/erc20.json'
import ITransactionFilter from './ITransactionFilter'

const filter: ITransactionFilter = {
  type: 'nativeTransferTo',
  filter (transaction) {
    return transaction.value.gt(0)
  },
  abi: ABI
}

export default filter
