import { id } from '@ethersproject/hash'

export const TRANSFER_TO_EVENT = 'erc20-transfers-to'

export const ERC20_TRANSFER_EVENT = 'Transfer(address,address,uint256)'

export const ERC20_TRANSFER_EVENT_HASH = id(ERC20_TRANSFER_EVENT)

export const SUPPORTED_EVENTS = [TRANSFER_TO_EVENT]
