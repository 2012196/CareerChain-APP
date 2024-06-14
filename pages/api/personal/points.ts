import prisma from "@/lib/db"
import { NextApiRequest, NextApiResponse } from "next/types"
import { z } from "zod"

const PointsHistoryQuery = z.object({
  slug: z.string().nonempty(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const result = PointsHistoryQuery.safeParse(req.query)
      if (!result.success) {
        return res.status(400).json({
          message: result.error.message,
        })
      }

      const user = await prisma.account.findUnique({
        where: {
          slug: result.data.slug,
        },
        include: {
          PersonalAccount: true,
        },
      })

      const allPoints = await prisma.awardedPoints.findMany({
        where: {
          personalId: user?.PersonalAccount?.id,
        },
        include: {
          awardedBy: {
            include: {
              account: true,
            },
          },
        },
      })

      return res.status(200).json(allPoints)
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" })
    }
  } else {
    return res.status(405).send({ message: "Method not allowed" })
  }
}
