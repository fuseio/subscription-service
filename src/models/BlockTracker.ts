import mongoose, { Schema, Document } from 'mongoose'

const blockTrackerSchema = new Schema({
  filter: {
    type: String,
    required: true
  },
  block: {
    type: Number
  }
})

export interface BlockTrackerDoc extends Document {
    filter: string;
    block: number;
}

export default mongoose.model<BlockTrackerDoc>(
  'BlockTracker',
  blockTrackerSchema
)
