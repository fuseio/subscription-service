import mongoose, { Schema, Document } from 'mongoose'

const eventFilterSchema = new Schema({
  type: {
    type: String,
    required: true
  },
  lastSyncedBlock: {
    type: Number,
    required: true
  }
})

export interface EventFilterDoc extends Document {
  type: string;
  lastSyncedBlock: number;
}

export default mongoose.model<EventFilterDoc>('EventFilter', eventFilterSchema)
