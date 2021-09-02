import { Interface } from '@ethersproject/abi'
import { Log } from '@ethersproject/providers'
import config from 'config'
import ERC20_ABI from '@constants/abi/erc20.json'
import ERC721_ABI from '@constants/abi/erc721.json'

export enum TokenType {
  ERC20 = 'ERC-20',
  ERC721 = 'ERC-721'
}

export const isProduction = process.env.NODE_ENV === 'production'

export const isStudioUrl = (url: string): boolean => {
  const studioBaseUrl: string = config.get('studio.baseUrl')
  const regex = new RegExp(studioBaseUrl)
  return regex.test(url)
}

export const parseLog = (log: Log, abi: any) => {
  const abiInterface = new Interface(abi)
  const parsedLog = abiInterface.parseLog(log)
  return {
    address: log.address,
    transactionHash: log.transactionHash,
    name: parsedLog.name,
    signature: parsedLog.signature,
    topic: parsedLog.topic,
    args: parsedLog.args
  }
}

export const sleep = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

export const getTransferEventTokenType = (log: Log) => {
  const topics = log.topics.slice(1).length
  return topics === 3 ? TokenType.ERC721 : TokenType.ERC20
}

export const getTokenTypeAbi = (tokenType: TokenType) => {
  return tokenType === TokenType.ERC20 ? ERC20_ABI : ERC721_ABI
}
