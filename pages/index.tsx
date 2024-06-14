import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { GetServerSideProps } from "next/types"

export default function Home({ userId, accountType }: any) {
  
  return (
    <div className="max-container">
      <h1 className="text-2xl bg-red-50">
        Logged in as: {userId} {accountType}
      </h1>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions)

  return {
    props: {
      userId: session?.user?.account_id || null,
      accountType: session?.user.account_type,
    },
  }
}
