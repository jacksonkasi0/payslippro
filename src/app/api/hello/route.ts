import { NextRequest, NextResponse } from 'next/server';

// GET method handler
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        message: "Hello from Next.js API!",
        timestamp: new Date().toISOString(),
        success: true
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal Server Error",
        success: false
      },
      { status: 500 }
    );
  }
}
