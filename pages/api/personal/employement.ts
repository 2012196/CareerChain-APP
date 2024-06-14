import prisma from "@/lib/db";
import { FetchEmployeementResponse } from "@/types/custom";
import { NextApiRequest, NextApiResponse } from "next/types";
import { z } from "zod";

const getEmployementSchema = z.object({
  slug: z.string().nonempty(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const result = getEmployementSchema.safeParse(req.query);

      if (!result.success) {
        return res.status(400).json({
          message: result.error.message,
        });
      }

      const { slug } = result.data;

      const user = await prisma.account.findUnique({
        where: {
          slug: slug,
        },
        include: {
          PersonalAccount: true,
        },
      });

      const employement = await prisma.employees.findMany({
        where: {
          personalId: user?.PersonalAccount?.id,
        },
        include: {
          employeer: {
            include: {
              account: true,
            },
          },
        },
      });

      const repsonseData: FetchEmployeementResponse[] = employement.map((emp) => ({
        employementIndex: emp.employementIndex,
        transactionHash: emp.transactionHash,
        orgAddress: emp.employeer.account.walletAddress,
        orgProfileImage: emp.employeer.account.profileImage,
        orgName: emp.employeer.name,
      }));

      return res.status(200).json(repsonseData);
    }
  } catch (err) {
    console.log(err);
  }
}
