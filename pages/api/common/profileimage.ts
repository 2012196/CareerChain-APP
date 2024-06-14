import type { NextApiRequest, NextApiResponse } from "next"
import { IncomingForm } from "formidable"
import fs from "fs"

import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "@/lib/db"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)

  if (req.method === "POST") {
    if (!session) {
      return res.status(403).json({ message: "You are not allowed" })
    }
    try {
      const form = new IncomingForm()
      form.parse(req, async (err, fields, files) => {
        await saveProfileImage(session.user.account_id, files.image)
      })
      return res.status(200).json({ message: "Profile image uploaded" })
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" })
    }
  } else {
    return res.status(405).send({ message: "Only POST requests allowed" })
  }
}

const saveProfileImage = async (accountId: number, image: any) => {
  const filename = `${image[0].newFilename}.jpg`
  const data = fs.readFileSync(image[0].filepath)
  fs.writeFileSync(`${process.cwd()}/public/images/profiles/${filename}`, data)
  fs.unlinkSync(image[0].filepath)
  await prisma.account.update({
    where: {
      id: accountId,
    },
    data: {
      profileImage: `${process.env.PUBLIC_PROFILE_IMAGES}/${filename}`,
    },
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
