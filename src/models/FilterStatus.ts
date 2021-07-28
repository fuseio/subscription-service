import mongoose, { Schema, Document } from 'mongoose'

const filterStatusSchema = new Schema({
  filter: {
    type: String,
    required: true
  },
  blockNumber: {
    type: Number
  }
}, {
  timestamps: true
})

export interface FilterStatusDoc extends Document {
    filter: string;
    blockNumber: number;
}

export default mongoose.model<FilterStatusDoc>(
  'FilterStatus',
  filterStatusSchema
)
