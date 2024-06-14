import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(function middleware(req) {
  const token: any = req.nextauth.token
  const pathname = req.nextUrl.pathname
  
  if (pathname === "/") {
    if(token.account_type === "admin"){
      return NextResponse.redirect(new URL(`/admin`, req.url))
    }

    if (token.account_type === "personal") {
      return NextResponse.redirect(new URL(`/personal/${token.slug}`, req.url))
    } else if (token.account_type === "org") {
      return NextResponse.redirect(new URL(`/org/${token.slug}`, req.url))
    }
  }
})

export const config = { matcher: ["/", "/personal", "/admin"] }
