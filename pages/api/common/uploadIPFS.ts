import { getServerSession } from "next-auth/next"
import { NextApiRequest, NextApiResponse } from "next/types"
import { authOptions } from "../auth/[...nextauth]"
import { IncomingForm } from "formidable"
import fs from "fs"
import pinataSDK from "@pinata/sdk"
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_API_SECRET,
})

const pinToIPFS = async (document: any) => {
  try {
    const stream = fs.createReadStream(document.filepath)
    const options = {
      pinataMetadata: {
        name: document.originalFilename,
      },
    }
    const response = await pinata.pinFileToIPFS(stream, options)
    fs.unlinkSync(document.filepath)
    return response
  } catch (error) {
    throw error
  }
}

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
      const { fields, files } = await new Promise<any>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err)
          } else {
            resolve({ fields, files })
          }
        })
      })

      if (files.document) {
        const { IpfsHash } = await pinToIPFS(files.document[0])
        return res
          .status(200)
          .json({ message: "File uploaded to IPFS", ipfsHash: IpfsHash })
      }

      return res.status(400).json({ message: "No file provided" })
    } catch (err) {
      res.status(500).json({ message: "Something went wrong" })
    }
  } else {
    return res.status(405).send({ message: "Only POST requests allowed" })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
