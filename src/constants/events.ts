import { id } from '@ethersproject/hash'

export const WALLET_TRANSFER_TO_EVENT = 'wallet.transfer.to'

export const ERC20_TRANSFER_EVENT = 'Transfer(address,address,uint256)'

export const ERC20_TRANSFER_EVENT_HASH = id(ERC20_TRANSFER_EVENT)
