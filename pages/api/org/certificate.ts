import { NextApiRequest, NextApiResponse } from "next/types"
import { z } from "zod"
import { authOptions } from "../auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/db"
import { AllowedAccountTypes } from "@/types/custom"
import { ActivityType } from "@prisma/client"

const createCertificateBody = z.object({
  transactionHash: z.string().nonempty(),
  orgCertID: z.number(),
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

      const result = createCertificateBody.safeParse(req.body)

      if (!result.success) {
        return res.status(400).json({
          message: result.error.message,
        })
      }

      if (session.user.account_id) {
        const org = await prisma.organizationAccount.findFirst({
          where: {
            account_id: session.user.account_id,
          },
        })

        const cert = await prisma.certificate.create({
          data: {
            orgCertId: result.data.orgCertID,
            transactionHash: result.data.transactionHash,
            createdBy: {
              connect: {
                id: org?.id,
              },
            },
          },
        })

        const activity = await prisma.activity.create({
          data: {
            type: ActivityType.CertificateCreated,
            transactionHash: result.data.transactionHash,
            OrganizationAccount: {
              connect: {
                id: org?.id,
              },
            },
            Actor: {
              connect: {
                id: session.user.account_id,
              },
            },
          },
        })

        return res.status(200).json({ certificate: cert, activity: activity })
      }
    } else if (req.method === "GET") {
      const { slug } = req.query

      if (slug) {
        const org = await prisma.account.findFirst({
          where: {
            slug: slug as string,
          },
          include: {
            OrganizationAccount: true,
          },
        })

        if (org) {
          const orgCertificates = await prisma.certificate.findMany({
            where: {
              orgId: org.OrganizationAccount?.id,
            },
          })

          return res.status(200).send(orgCertificates)
        }
      }

      return res
        .status(500)
        .send({ message: "Failed to fetch organization certificates" })
    } else {
      return res.status(405).send({ message: "Method not allowed" })
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
