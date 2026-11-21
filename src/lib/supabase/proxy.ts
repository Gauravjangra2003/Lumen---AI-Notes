import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { safeRedirectPath } from "@/lib/safe-redirect";
import type { Database } from "@/types/database.types";

const PROTECTED_PREFIXES = ["/notes"];
const AUTH_PAGES = ["/login"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() validates the JWT and refreshes an expired session. Nothing may
  // run between creating the client and this call, or users get logged out randomly.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims);

  const { pathname } = request.nextUrl;
  const redirectTo = (path: string) => {
    const url = new URL(path, request.nextUrl.origin);
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (!isSignedIn && PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return redirectTo("/login");
  }

  if (isSignedIn && AUTH_PAGES.includes(pathname)) {
    return redirectTo(safeRedirectPath(request.nextUrl.searchParams.get("next")));
  }

  return response;
}
