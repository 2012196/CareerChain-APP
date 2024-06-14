import { NextApiRequest, NextApiResponse } from "next/types";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { AllowedAccountTypes, FetchEmployeesResponse } from "@/types/custom";
import prisma from "@/lib/db";

const createEmpBody = z.object({
  transactionHash: z.string().nonempty(),
  personalID: z.number(),
  empIndex: z.number(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  try {
    if (req.method === "POST") {
      if (!session || !(session.user.account_type === AllowedAccountTypes.org)) {
        return res.status(403).json({ message: "You are not allowed" });
      }

      const result = createEmpBody.safeParse(req.body);

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

        const employee = await prisma.employees.create({
          data: {
            transactionHash: result.data.transactionHash,
            personalId: result.data.personalID,
            orgId: org?.id as number,
            employementIndex: result.data.empIndex,
          },
        });

        return res.status(200).json({ employee: employee });
      }
    } else if (req.method === "GET") {
      const { slug } = req.query;

      if (slug) {
        const org = await prisma.account.findFirst({
          where: {
            slug: slug as string,
          },
          include: {
            OrganizationAccount: true,
          },
        });

        if (org) {
          const employees = await prisma.employees.findMany({
            where: {
              orgId: org.OrganizationAccount?.id,
            },
            include: {
              employee: {
                include: {
                  account: true,
                },
              },
              employeer: {
                include: {
                  account: true,
                },
              },
            },
          });

          const repsonseData: FetchEmployeesResponse[] = employees.map((emp) => ({
            transactionHash: emp.transactionHash,
            orgAddress: emp.employeer.account.walletAddress,
            personalAddress: emp.employee.account.walletAddress,
            profileName: emp.employee.name,
            profileImage: emp.employee.account.profileImage,
            orgProfileImage: emp.employeer.account.profileImage,
            empIndex: emp.employementIndex
          }));

          return res.status(200).json(repsonseData);
        }
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
}
