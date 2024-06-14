import prisma from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next/types";
import { z } from "zod";

const searchPersonal = z.object({
  query: z.string().nonempty(),
  includeOnly: z.enum(["all", "personal", "org"]).default("all"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const result = searchPersonal.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          message: result.error.message,
        });
      }

      const { query, includeOnly } = result.data;
      let dbQuery = {};

      if (includeOnly === "all") {
        dbQuery = {
          where: {
            slug: {
              contains: query,
              mode: "insensitive",
            },
          },
          include: {
            PersonalAccount: true,
            OrganizationAccount: true,
          },
        };
      } else if (includeOnly === "personal") {
        dbQuery = {
          where: {
            AND: [
              {
                slug: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                NOT: {
                  PersonalAccount: null,
                },
              },
            ],
          },
          include: {
            PersonalAccount: true,
          },
        };
      } else if (includeOnly === "org") {
        dbQuery = {
          where: {
            AND: [
              {
                slug: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                NOT: {
                  OrganizationAccount: null,
                },
              },
            ],
          },
          include: {
            OrganizationAccount: true,
          },
        };
      }

      const users = await prisma.account.findMany(dbQuery);
      res.status(200).send(users);
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
}
