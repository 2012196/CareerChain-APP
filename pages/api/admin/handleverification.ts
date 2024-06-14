import { getServerSession } from "next-auth/next";
import { NextApiRequest, NextApiResponse } from "next/types";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/db";
import z from "zod";

const handleVerificationBody = z.object({
  orgID: z.number(),
  accept: z.boolean(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  try {
    if (req.method === "POST") {
      if (!session || session.user.account_type !== "admin") {
        return res.status(403).json({ message: "You are not allowed" });
      }

      const result = handleVerificationBody.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: result.error.message,
        });
      }

      if (result.data.accept) {
        await prisma.organizationAccount.update({
          data: {
            verified: true,
          },
          where: {
            id: result.data.orgID,
          },
        });
      }

      await prisma.verificationRequest.delete({
        where: {
          orgId: result.data.orgID,
        },
      });

      return res.status(200).send({});
    } else if (req.method === "GET") {
      if (!session || session.user.account_type !== "admin") {
        return res.status(403).json({ message: "You are not allowed" });
      }

      const allVerificationRequests = await prisma.verificationRequest.findMany({
        include: {
          OrganizationAccount: {
            include: {
              account: true,
            },
          },
        },
      });

      return res.status(200).json(allVerificationRequests);
      
    } else {
      return res.status(405).send({ message: "Method not allowed" });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err });
  }
}
