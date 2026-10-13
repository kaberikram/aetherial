import type { NextRequest } from "next/server"
import { completeAuthLink } from "@/utils/auth/complete-auth-link"

export async function GET(request: NextRequest) {
  return completeAuthLink(request)
}
