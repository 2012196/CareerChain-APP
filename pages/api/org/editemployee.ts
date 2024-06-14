import { NextApiRequest, NextApiResponse } from "next/types";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { AllowedAccountTypes } from "@/types/custom";
import prisma from "@/lib/db";

const editEmpBody = z.object({
  transactionHash: z.string().nonempty(),
  empIndex: z.number(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  try {
    if (req.method === "POST") {
      if (!session || !(session.user.account_type === AllowedAccountTypes.org)) {
        return res.status(403).json({ message: "You are not allowed" });
      }

      const result = editEmpBody.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          message: result.error.message,
        });
      }

      if (session.user.account_id) {
        const org = await prisma.organizationAccount.findFirst({
          where: {
            account_id: session.user.account_id,
          },
        });

        if (!org) {
          return res.status(500).json({ message: "No org found" });
        }

        const employee = await prisma.employees.update({
          where: {
            orgId_employementIndex: {
              orgId: org.id,
              employementIndex: result.data.empIndex,
            },
          },
          data: {
            transactionHash: result.data.transactionHash,
          },
        });

        return res.status(200).json({ employee: employee });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
}
