import { NextResponse } from "next/server"

// This is a server-side API route that can safely access environment variables
// without exposing them to the client
export async function GET() {
  return NextResponse.json({
    walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID || '891aaf3e0e3c9c7ca427dfe291ac3ec4',
  })
} 