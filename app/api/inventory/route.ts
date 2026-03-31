import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Inventory, Location, Product } from "@/lib/models";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("location");

    await connectToDatabase();

    let query = {};
    if (locationId) {
      query = { location: locationId };
    }

    const inventory = await Inventory.find(query)
      .populate("location")
      .populate({
        path: "product",
        populate: [{ path: "supplier" }, { path: "contract" }],
      })
      .sort({ "location.name": 1, "product.name": 1 })
      .lean();

    // Ensure price is set correctly from contract if it's 0
    const processedInventory = inventory.map((item: any) => {
      if (
        item.product &&
        (!item.product.price || item.product.price === 0) &&
        item.product.contract
      ) {
        const contractItem = item.product.contract.items?.find(
          (i: any) => i.product?.toString() === item.product._id.toString(),
        );
        if (contractItem && contractItem.pricePerUnit) {
          item.product.price = contractItem.pricePerUnit;
        }
      }
      return item;
    });

    return NextResponse.json(processedInventory);
  } catch (error: any) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
