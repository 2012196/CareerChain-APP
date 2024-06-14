import prisma from "@/lib/db"
import { AllowedAccountTypes } from "@/types/custom"
import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"

const RegisterPersonalAccount = z.object({
  walletAddress: z.string().nonempty(),
  name: z.string().nonempty(),
  city: z.string().nonempty(),
  country: z.string().nonempty(),
  job_title: z.string(),
  slug: z.string().nonempty().max(10)
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const result = RegisterPersonalAccount.safeParse(req.body)
      if (!result.success) {
        return res.status(400).json({
          message: result.error.message,
        })
      }

      const { name, walletAddress, city, country, job_title, slug } = result.data

      const walletExist = await prisma.account.findUnique({
        where: { walletAddress: walletAddress },
      })

      if (walletExist) {
        return res.status(409).json({ message: "Wallet already exists" })
      }

      const newAccount = await prisma.account.create({
        data: {
          slug: slug,
          walletAddress: walletAddress,
          city: city,
          country: country,
          account_type: AllowedAccountTypes.personal,
        },
      })

      if (newAccount) {
        const newPersonalAccount = await prisma.personalAccount.create({
          data: {
            name: name,
            account_id: newAccount.id,
            job_title: job_title,
          },
        })
      }

      res
        .status(201)
        .json({ user: newAccount, message: "Account created successfully" })
    } catch (err) {
      res.status(500).json({ message: err })
    }
  } else {
    return res.status(405).send({ message: "Only POST requests allowed" })
  }
}
