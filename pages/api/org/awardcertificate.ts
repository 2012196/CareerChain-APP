import { NextApiRequest, NextApiResponse } from "next/types"
import { z } from "zod"
import { authOptions } from "../auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/db"
import { AllowedAccountTypes } from "@/types/custom"
import { ActivityType } from "@prisma/client"

const awardCertificateBody = z.object({
  transactionHash: z.string().nonempty(),
  orgCertID: z.number(),
  personalID: z.number(),
})

const awardCertificateGET = z.object({
  type: z.enum([AllowedAccountTypes.org, AllowedAccountTypes.personal]),
  slug: z.string().nonempty(),
  certId: z.string().optional(),
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
        session.user.account_type !== AllowedAccountTypes.org
      ) {
        return res.status(403).json({ message: "You are not allowed" })
      }

      const result = awardCertificateBody.safeParse(req.body)

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

        const awardedCert = await prisma.awardedCertificate.create({
          data: {
            orgCertId: result.data.orgCertID,
            createdBy: session.user.walletAddress,
            transactionHash: result.data.transactionHash,
            awardedBy: {
              connect: {
                id: org?.id,
              },
            },
            awardedTo: {
              connect: {
                id: result.data.personalID,
              },
            },
          }
        })

        const personal = await prisma.personalAccount.findUnique({
          where: {
            id: result.data.personalID,
          },
          include: {
            account: true,
          },
        })

        const activity = await prisma.activity.create({
          data: {
            type: ActivityType.CertificateAwarded,
            transactionHash: result.data.transactionHash,
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
          .json({ awarded: awardedCert, activity: activity })
      }
    } else if (req.method === "GET") {
      const result = awardCertificateGET.safeParse(req.query)

      if (!result.success) {
        return res.status(400).json({
          message: result.error.message,
        })
      }

      if (result.data.type === AllowedAccountTypes.personal) {
        const personal = await prisma.account.findUnique({
          where: {
            slug: result.data.slug as string,
          },
          include: {
            PersonalAccount: {
              include: {
                awardedCertificate: {
                  include: {
                    awardedBy: {
                      include: {
                        account: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })
        return res
          .status(200)
          .json(personal?.PersonalAccount?.awardedCertificate)
      } else if (result.data.type === AllowedAccountTypes.org) {
        const org = await prisma.account.findUnique({
          where: {
            slug: result.data.slug as string,
          },
          include: {
            OrganizationAccount: true,
          },
        })

        if (!org || !result.data.certId) {
          return res
            .status(404)
            .json({ message: "Could not find organization with this org id or invalid certId" })
        }

        const awardedCert = await prisma.awardedCertificate.findMany({
          where: {
            orgId: org.OrganizationAccount?.id,
            orgCertId: parseInt(result.data.certId),
          },
          include: {
            awardedTo: {
              include: {
                account: true,
              },
            },
          },
        })

        return res.status(200).json({ awardedCert })
      }
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
