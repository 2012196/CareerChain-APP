import { NextApiRequest, NextApiResponse } from "next/types";
import { z } from "zod";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/db";

const EditProfile = z.object({
  aboutMe: z.string().nonempty(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    try {
      if (!session) {
        return res.status(403).json({ message: "You are not allowed" });
      }

      const result = EditProfile.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: result.error.message,
        });
      }

      if (session.user.account_id) {
        const user = await prisma.personalAccount.update({
          where: { account_id: session.user.account_id },
          data: {
            aboutMe: result.data.aboutMe,
          },
        });
        return res.status(200).json(user);
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  } else {
    return res.status(405).send({ message: "Method not allowed" });
  }
}
