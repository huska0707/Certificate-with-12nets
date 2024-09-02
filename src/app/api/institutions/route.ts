import { getInstitutions } from "@/actions/institutions";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const data = await getInstitutions()

        return NextResponse.json(data, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Failed to fetch institutions." },
            { status: 500 }
        )
    }
}