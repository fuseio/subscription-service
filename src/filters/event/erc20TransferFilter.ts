import { TRANSFER_TO_EVENT } from '@constants/events'
import { id } from '@ethersproject/hash'
import ABI from '../../constants/abi/erc20.json'
import IEventFilter from './IEventFilter'

const filter: IEventFilter = {
  name: 'erc20Transfer',
  type: 'eventFilter',
  event: TRANSFER_TO_EVENT,
  filter: {
    topics: [id('Transfer(address,address,uint256)')]
  },
  abi: ABI
}

export default filter
