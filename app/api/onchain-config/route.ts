import { NextResponse } from "next/server"

// This is a server-side API route that can safely access environment variables
// without exposing them to the client
export async function GET() {
  // Only return the project ID which is safe to expose
  // Keep the API key on the server
  return NextResponse.json({
    projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID,
  })
}
