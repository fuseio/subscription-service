import { TransactionResponse } from '@ethersproject/providers'

export default interface ITransactionFilter {
  name: string;
  type: string;
  event: string;
  filter: (transaction: TransactionResponse) => boolean;
}
