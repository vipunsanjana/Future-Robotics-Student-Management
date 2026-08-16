import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User, { type UserRole } from "@/models/User";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false as const, status: 401, message: "Not signed in" };
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") return { ok: false as const, status: 403, message: "Admin access required" };
  return { ok: true as const, session };
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  await connectDB();

  const { id } = params;

  // Strict check to prevent Mongoose CastError on invalid string IDs
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { role, name, email } = body;

    const updates: any = {};
    if (role && (role === "admin" || role === "manager")) {
      updates.role = role as UserRole;
    }
    if (name !== undefined) {
      updates.name = name.trim();
    }
    if (email !== undefined) {
      const formattedEmail = email.trim().toLowerCase();
      
      const existing = await User.findOne({ email: formattedEmail, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
      }
      
      updates.email = formattedEmail;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, { 
      returnDocument: 'after', 
      runValidators: true 
    }).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      ok: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const check = await requireAdmin();
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  await connectDB();

  const currentUserId = (check.session.user as any)?.id;
  const { id } = params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
  }

  if (currentUserId === id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
