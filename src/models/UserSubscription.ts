import mongoose, { Schema, Document } from 'mongoose'

const userSubscriptionSchema = new Schema({
  eventName: {
    type: String,
    required: true
  },
  webhookUrl: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

export interface UserSubscriptionDoc extends Document {
  eventName: string;
  webhookUrl: string;
  user: any;
}

export default mongoose.model<UserSubscriptionDoc>(
  'UserSubscription',
  userSubscriptionSchema
)
