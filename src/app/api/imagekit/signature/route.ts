import { NextResponse } from "next/server";

// Minimal route handler to provide a proper module for build.
// Original implementation generated ImageKit signatures; this placeholder
// returns a simple JSON object. Replace with your real implementation
// if needed.
export async function GET() {
	return NextResponse.json({ ok: true, message: "placeholder signature route" });
}
