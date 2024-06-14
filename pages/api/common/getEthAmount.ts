import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next/types";
import { z } from "zod";

const getEthAmountQuery = z.object({
  amount: z.preprocess((val) => parseFloat(val as string), z.number().positive()),
  from: z.string(),
  to: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const result = getEthAmountQuery.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          message: result.error.message,
        });
      }

      const response = await axios.get(
        `https://pro-api.coinmarketcap.com/v2/tools/price-conversion?amount=${result.data.amount}&symbol=${result.data.from}&convert=${result.data.to}`,
        {
          headers: {
            "X-CMC_PRO_API_KEY": "a974b28f-5b24-4a26-a9b5-dbb8dcf83198",
            Accepts: "application/json",
          },
        }
      );

      return res.json(response.data.data[0].quote);
    } catch (err) {
      res.status(500).json({ message: "Something went wrong", err: err });
    }
  } else {
    return res.status(405).send({ message: "Method not allowed" });
  }
}
