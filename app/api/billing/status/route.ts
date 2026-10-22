import { getCurrentBillingStatus } from "@/lib/billing";
import { NextResponse } from "next/server";

export async function GET() {
    const billing = await getCurrentBillingStatus();

    if (!billing) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(billing);
}
