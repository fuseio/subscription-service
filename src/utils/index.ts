import { Interface } from '@ethersproject/abi'
import { Log } from '@ethersproject/providers'
import config from 'config'

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

export const parseTransaction = (transaction: any) => {
  return transaction
}
