import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";


interface UserResponse {
  success: boolean;
  message?: string;
  data?: unknown; // Replace 'unknown' with your proper User type if available
}

interface UserParams {
  params: { id: string };
}

export async function GET(_: Request, { params }: UserParams): Promise<NextResponse<UserResponse>> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: params.id },
            include: { roles: true },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" }, 
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        console.error("GET /users/[id] error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch user" },
            { status: 500 }
        );
    }
}

interface UpdateUserBody {
    name?: string;
    email?: string;
    password?: string;
    roles?: string[] | { id: string }[]; // Adjust based on your role ID type
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
      const body = await req.json();
      const { name, email, password, role } = body;
  
      if (!email || !role) {
        return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
      }
  
      const dataToUpdate: any = {
        name,
        email,
        role,
      };
  
      if (password) {
        dataToUpdate.password = await bcrypt.hash(password, 10);
      }
  
      const updated = await prisma.user.update({
        where: { id: params.id },
        data: dataToUpdate,
      });
  
      return NextResponse.json({ success: true, data: updated });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
  }
export async function DELETE(_: Request, { params }: UserParams): Promise<NextResponse<UserResponse>> {
    try {
        await prisma.user.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true, message: "User deleted" });
    } catch (error: unknown) {
        console.error("DELETE /users/[id] error:", error);
        
        let errorMessage = "Delete failed";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
}