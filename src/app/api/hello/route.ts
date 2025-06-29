import { NextResponse } from 'next/server';

// GET method handler
export async function GET() {
  try {
    return NextResponse.json(
      {
        message: "Hello from Next.js API!",
        timestamp: new Date().toISOString(),
        success: true
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        message: "Internal Server Error",
        success: false
      },
      { status: 500 }
    );
  }
}
