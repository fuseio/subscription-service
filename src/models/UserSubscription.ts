import mongoose, { Schema } from 'mongoose'

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

export default mongoose.model('UserSubscription', userSubscriptionSchema)
