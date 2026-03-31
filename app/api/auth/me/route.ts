import { NextResponse } from "next/server";

export async function GET() {
  console.log("GET /api/auth/me called");
  try {
    // Bypassing auth for development
    console.log("Returning dev user");
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
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
