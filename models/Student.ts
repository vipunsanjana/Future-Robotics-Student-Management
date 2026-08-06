import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  phone: string;
  regNo: string;
  course: string;
  email?: string;
  courseCode: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    regNo: { type: String, required: true, unique: true, trim: true, uppercase: true },
    course: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    courseCode: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

StudentSchema.index({ name: 'text', course: 'text' });

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
