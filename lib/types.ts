import type { ObjectId } from "mongodb";

export interface Registration {
  _id?: string | ObjectId;
  name: string;
  phone: string;
  regNo: string;
  course: string;
  amount: number;
  courseCode: string;
  date: string;
  description: string;
  mode: CourseMode;
  documentNo: string;
  createdAt: string;
}

export type CourseMode = "Online" | "Recording";
export type CourseStatus = "Online" | "Recording";

export interface Payment {
  _id?: string | ObjectId;
  studentId: string;
  studentName: string;
  studentRegNo: string;
  courseCode?: string;
  amount: number;
  date: string;
  description: string;
  documentNo: string;
  isCompleted: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  _id?: string | ObjectId;
  courseCode: string;
  title: string;
  lecturer: string;
  duration: string;
  fee: number;
  status: CourseStatus;
}

export interface Student {
  _id?: string | ObjectId;
  name: string;
  phone: string;
  regNo: string;
  course: string;
  courseCode: string;
  email?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}
