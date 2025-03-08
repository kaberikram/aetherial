import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/home"

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {}
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the user after exchanging the code
      const { data: { user } } = await supabase.auth.getUser()
      
      // Check if email confirmation is required (you can set this in your Supabase dashboard)
      if (user?.email_confirmed_at || process.env.NEXT_PUBLIC_SUPABASE_EMAIL_CONFIRMATION !== 'true') {
        return NextResponse.redirect(new URL(next, request.url))
      } else {
        // If email confirmation is required but email isn't confirmed
        return NextResponse.redirect(new URL("/auth/confirm-email", request.url))
      }
    }
  }

  // Return the user to the login page if something goes wrong
  return NextResponse.redirect(new URL("/login", request.url))
} 