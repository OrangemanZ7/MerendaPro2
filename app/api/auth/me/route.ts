import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models";

export async function GET() {
  try {
    // Bypassing auth for development
    return NextResponse.json({
      authenticated: true,
      user: {
        id: "dev-user-123",
        name: "Desenvolvedor",
        email: "dev@example.com",
        role: "admin",
        location: "Sede",
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
