import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const res = await query("SELECT * FROM prompts;");
    return NextResponse.json({ prompts: res.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}