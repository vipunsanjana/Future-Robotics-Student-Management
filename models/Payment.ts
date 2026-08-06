import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentRegNo: string;
  amount: number;
  date: string;
  description: string;
  documentNo: string;
  isCompleted?: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true },
    studentRegNo: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    documentNo: { type: String, required: true, unique: true },
    isCompleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

PaymentSchema.index({ studentId: 1, date: -1 });
PaymentSchema.index({ documentNo: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
