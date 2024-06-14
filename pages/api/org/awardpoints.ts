import { NextApiRequest, NextApiResponse } from "next/types"
import { z } from "zod"
import { authOptions } from "../auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/db"
import { AllowedAccountTypes } from "@/types/custom"
import { ActivityType } from "@prisma/client"

const awardPointsBody = z.object({
  transactionHash: z.string().nonempty(),
  amount: z.coerce.number().min(1),
  reason: z.string().nonempty(),
  awardedTo: z.number(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)

  try {
    if (req.method === "POST") {
      if (
        !session ||
        !(session.user.account_type === AllowedAccountTypes.org)
      ) {
        return res.status(403).json({ message: "You are not allowed" })
      }

      const result = awardPointsBody.safeParse(req.body)

      if (!result.success) {
        return res.status(400).json({
          message: result.error.message,
        })
      }

      if (session.user.account_id) {
        const org = await prisma.organizationAccount.findUnique({
          where: {
            account_id: session.user.account_id,
          },
        })

        const awardedPoints = await prisma.awardedPoints.create({
          data: {
            amount: result.data.amount,
            reason: result.data.reason,
            transactionHash: result.data.transactionHash,
            awardedBy: {
              connect: {
                id: org?.id,
              },
            },
            awardedTo: {
              connect: {
                id: result.data.awardedTo,
              },
            },
          },
        })

        const personal = await prisma.personalAccount.findUnique({
          where: {
            id: result.data.awardedTo,
          },
          include: {
            account: true,
          },
        })

        const activity = await prisma.activity.create({
          data: {
            type: ActivityType.PointsAwarded,
            transactionHash: result.data.transactionHash,
            amount: result.data.amount,
            reason: result.data.reason,
            OrganizationAccount: {
              connect: {
                id: org?.id,
              },
            },
            Actor: {
              connect: {
                id: personal?.account.id,
              },
            },
          },
        })

        return res
          .status(200)
          .json({ awarded: awardedPoints, activity: activity })
      }
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err })
  }
}
