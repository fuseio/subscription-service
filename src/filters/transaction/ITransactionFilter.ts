import { TransactionResponse } from '@ethersproject/providers'

export default interface ITransactionFilter {
  type: string;
  filter: (transaction: TransactionResponse) => boolean;
}
