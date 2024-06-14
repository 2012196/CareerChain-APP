import { NextApiRequest, NextApiResponse } from "next/types"
import { z } from "zod"
import { authOptions } from "../auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/db"

const EditProfile = z.object({
  aboutUs: z.string().nonempty(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  if (req.method === "POST") {
    try {
      const result = EditProfile.safeParse(req.body)
      if (!result.success) {
        return res.status(400).json({
          message: result.error.message,
        })
      }
      if (!session) {
        return res.status(403).json({ message: "You are not allowed" })
      }
      if (session.user.account_id) {
        const user = await prisma.organizationAccount.update({
          where: { account_id: session.user.account_id },
          data: {
            aboutUs: result.data.aboutUs,
          },
        })
        return res.status(200).json(user)
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" })
    }
    
  } else {
    return res.status(405).send({ message: "Method not allowed" })
  }
}
