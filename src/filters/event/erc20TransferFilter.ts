import { id } from '@ethersproject/hash'
import ABI from '../../constants/abi/erc20.json'
import IEventFilter from './IEventFilter'

const filter: IEventFilter = {
  type: 'erc20Transfer',
  filter: {
    topics: [id('Transfer(address,address,uint256)')]
  },
  abi: ABI
}

export default filter
