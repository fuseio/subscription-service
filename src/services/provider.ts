import { JsonRpcProvider, Provider } from '@ethersproject/providers'
import config from 'config'
import { Service } from 'typedi'

@Service()
export default class ProviderService {
  private readonly provider: Provider

  constructor () {
    this.provider = new JsonRpcProvider(config.get('rpcUrl'))
  }

  getProvider () {
    return this.provider
  }
}
