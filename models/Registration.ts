import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    regNo: { type: String, required: true },
    course: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    description: { type: String },
    mode: { type: String, required: true },
    documentNo: { type: String },
  },
  { timestamps: true }
);

// Prevent mongoose from compiling the model multiple times in Next.js development
const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);

export default Registration;
