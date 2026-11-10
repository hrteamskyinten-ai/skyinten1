import mongoose from "mongoose";

const paymentHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    enum: ['course', 'hackathon'],
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  transactionStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for faster queries
paymentHistorySchema.index({ studentEmail: 1, itemType: 1 });
paymentHistorySchema.index({ itemType: 1 });
paymentHistorySchema.index({ purchasedAt: -1 });

const paymentHistoryModel = mongoose.models.PaymentHistory || mongoose.model('PaymentHistory', paymentHistorySchema);
export default paymentHistoryModel;
