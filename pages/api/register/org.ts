import prisma from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const RegisterOrgAccount = z.object({
  walletAddress: z.string().nonempty(),
  orgName: z.string().nonempty("Organization name cannot be empty"),
  orgWebsite: z
    .string()
    .nonempty()
    .refine(
      (value) => {
        // Regular expression for validating domain names
        const domainNameRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
        return domainNameRegex.test(value);
      },
      {
        message: "Please provide a valid domain name",
      }
    ),
  city: z.string().nonempty(),
  country: z.string().nonempty(),
  slug: z.string().nonempty().max(10),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const result = RegisterOrgAccount.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: result.error.message,
        });
      }

      const { slug, orgName, orgWebsite, walletAddress, country, city } = result.data;
      const walletExist = await prisma.account.findUnique({
        where: { walletAddress: walletAddress },
      });

      if (walletExist) {
        return res.status(409).json({ message: "Wallet already exists" });
      }

      const newAccount = await prisma.account.create({
        data: {
          slug: slug,
          walletAddress: walletAddress,
          account_type: "org",
          country: country,
          city: city,
        },
      });

      if (newAccount) {
        const newOrgAccount = await prisma.organizationAccount.create({
          data: {
            name: orgName,
            website: orgWebsite,
            account_id: newAccount.id,
          },
        });
      }

      res.status(201).json({ user: newAccount, message: "Account created successfully" });
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  } else {
    return res.status(405).send({ message: "Only POST requests allowed" });
  }
}
