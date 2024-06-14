import { getServerSession } from "next-auth/next";
import { NextApiRequest, NextApiResponse } from "next/types";
import { authOptions } from "../auth/[...nextauth]";
import { AllowedAccountTypes } from "@/types/custom";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  try {
    if (req.method === "POST") {
      if (!session || session.user.account_type !== AllowedAccountTypes.org) {
        return res.status(403).json({ message: "You are not allowed" });
      }

      const org = await prisma.organizationAccount.findUnique({
        where: {
          account_id: session.user.account_id,
        },
      });

      if (!org) {
        return res.status(403).json({ message: "Org don't exist" });
      }

      const verificationKey = uuidv4();

      const verficationRequest = await prisma.verificationRequest.create({
        data: {
          verificationKey: verificationKey,
          OrganizationAccount: {
            connect: {
              id: org.id,
            },
          },
        },
      });

      return res.status(200).json(verficationRequest);
    } else if (req.method === "GET") {
      if (!session || session.user.account_type !== AllowedAccountTypes.org) {
        return res.status(403).json({ message: "You are not allowed" });
      }

      const org = await prisma.organizationAccount.findUnique({
        where: {
          account_id: session.user.account_id,
        },
      });

      if (!org) {
        return res.status(403).json({ message: "Org don't exist" });
      }

      const verificationReq = await prisma.verificationRequest.findUnique({
        where: {
          orgId: org.id,
        },
      });

      return res.status(200).json(verificationReq);
    } else {
      return res.status(405).send({ message: "Method not allowed" });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
}
