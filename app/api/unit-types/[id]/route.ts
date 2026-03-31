import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { UnitType } from "@/lib/models";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    await dbConnect();
    const body = await request.json();
    const unitType = await UnitType.findByIdAndUpdate(resolvedParams.id, body, {
      new: true,
      runValidators: true,
    });
    if (!unitType) {
      return NextResponse.json(
        { error: "Tipo de unidade não encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json(unitType);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    await dbConnect();
    const unitType = await UnitType.findByIdAndDelete(resolvedParams.id);
    if (!unitType) {
      return NextResponse.json(
        { error: "Tipo de unidade não encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      message: "Tipo de unidade removido com sucesso",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
