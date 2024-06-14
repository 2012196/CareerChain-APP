import { ExternalLink, ScrollText } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import Link from "next/link"

interface Props {
  username: string
  transactionHash: string
  timestamp: Date
  amount: number | null
  reason: string
  awardedBy: string
}

const PointsHistoryItem = (props: Props) => {
  return (
    <Card className="p-3">
      <CardContent className="pl-2 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <ScrollText width={18} className="text-purple-custom" />
          <p className="flex flex-col">
            <div>
              <span className="font-semibold">@{props.username}</span>
              {` has been awarded ${props.amount} points by `}
              {<span className="font-semibold">@{props.awardedBy}</span>}
            </div>
            <small className="text-gray-customlight mt-2"><span>Reason: </span>{props.reason}</small>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <small>{props.timestamp.toString()}</small>
          <Link
            href={`${process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL}tx/${props.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <small className="text-gray-customlight flex items-center gap-1 cursor-pointer">
              View transaction <ExternalLink width={18} />
            </small>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default PointsHistoryItem
