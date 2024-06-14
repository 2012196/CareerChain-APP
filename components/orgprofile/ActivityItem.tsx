import { ExternalLink, ScrollText } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { useEffect, useState } from "react"
import { ActivityType } from "@prisma/client"
import Link from "next/link"

interface Props {
  activityType: string
  username: string
  transactionHash: string
  timestamp: Date
  amount: number | null
}

const ActivityItem = (props: Props) => {
  const [activityMsg, setActivityMsg] = useState("")

  useEffect(() => {
    if (props.activityType === ActivityType.CertificateCreated) {
      setActivityMsg(` has created a certificate`)
    } else if (props.activityType === ActivityType.CertificateAwarded) {
      setActivityMsg(` has been awarded a certificate by the organization`)
    } else if (props.activityType === ActivityType.PointsAwarded) {
      setActivityMsg(` has been awarded ${props.amount} points by the organization`)
    }
  }, [props.activityType, props.username, props.amount])

  return (
    <Card className="p-3">
      <CardContent className="pl-2 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <ScrollText width={18} className="text-purple-custom" />
          <p>
            <span className="font-semibold">@{props.username}</span>
            {activityMsg}
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

export default ActivityItem
