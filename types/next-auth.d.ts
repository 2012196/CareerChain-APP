import NextAuth from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User {
    account_id: number
    account_type: string
    slug: string
  }

  interface Session {
    user: User & {
      walletAddress: string
    }
  }
}
