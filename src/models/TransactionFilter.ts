import mongoose, { Schema, Document } from 'mongoose'

const transactionFilterSchema = new Schema({
  type: {
    type: String,
    required: true
  },
  lastSyncedBlock: {
    type: Number,
    required: true
  }
})

export interface TransactionFilterDoc extends Document {
  type: string;
  lastSyncedBlock: number;
}

export default mongoose.model<TransactionFilterDoc>(
  'TransactionFilter',
  transactionFilterSchema
)
