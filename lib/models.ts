import mongoose, { Schema } from "mongoose";
import type {
  Student as StudentType,
  Payment as PaymentType,
  Registration as RegistrationType,
  Course as CourseType,
} from "@/lib/types";

// --- Student Schema ---
const StudentSchema = new Schema<StudentType>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    regNo: { type: String, required: true, unique: true, trim: true, uppercase: true },
    course: { type: String, required: true, trim: true },
    courseCode: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

// --- Payment Schema ---
const PaymentSchema = new Schema<PaymentType>(
  {
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    studentRegNo: { type: String, required: true },
    courseCode: { type: String }, // <-- This will now save properly
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    documentNo: { type: String, required: true, unique: true },
    isCompleted: { type: Boolean, default: false },
    createdBy: { type: String },
  },
  { timestamps: true }
);

// --- Registration Schema ---
const RegistrationSchema = new Schema<RegistrationType>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    regNo: { type: String, required: true, trim: true, uppercase: true },
    course: { type: String, required: true, trim: true },
    courseCode: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    mode: { type: String, required: true, enum: ["Online", "Recording"] },
    documentNo: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// --- Course Schema ---
const CourseSchema = new Schema<CourseType>(
  {
    courseCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    lecturer: { type: String, required: true, trim: true },
    duration: { type: String, required: true },
    fee: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ["Online", "Recording"] },
  },
  { timestamps: true }
);

// --- CLEAR CACHE (Fixes Next.js hot-reload bug) ---
if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Student;
  delete mongoose.models.Payment;
  delete mongoose.models.Registration;
  delete mongoose.models.Course;
}

// Export Models
export const Student = mongoose.models.Student || mongoose.model<StudentType>("Student", StudentSchema);
export const Payment = mongoose.models.Payment || mongoose.model<PaymentType>("Payment", PaymentSchema);
export const Registration = mongoose.models.Registration || mongoose.model<RegistrationType>("Registration", RegistrationSchema);
export const Course = mongoose.models.Course || mongoose.model<CourseType>("Course", CourseSchema);
