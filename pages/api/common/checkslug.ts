import prisma from "@/lib/db"
import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next/types"

export const checkSlug = async (slug: string) => {
  if (slug) {
    const response = await axios.get(
      `/api/common/checkslug?profileName=${slug}`
    )
    return response.status
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { profileName } = req.query

      if (profileName === "") {
        return res
          .status(400)
          .json({ message: "Please provide a profile name" })
      }

      const user = await prisma.account.findUnique({
        where: {
          slug: profileName as string,
        },
      })

      if (user) {
        return res.status(409).json({ message: "Profile name already taken" })
      }
      return res.status(200).json({ message: "Available" })
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" })
    }
  } else {
    return res.status(405).send({ message: "Method not allowed" })
  }
}
