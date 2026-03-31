import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { UnitType } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();
    const unitTypes = await UnitType.find().sort({ name: 1 });
    return NextResponse.json(unitTypes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const unitType = await UnitType.create(body);
    return NextResponse.json(unitType, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
