import { AuthPersonalAccount } from "@/types/custom"
import {
  Account,
  AwardedPoints,
  OrganizationAccount,
} from "@prisma/client"
import axios from "axios"
import { useQuery } from "react-query"
import PointsHistoryItem from "./PointsHistoryItem"
import EmptyCard from "../EmptyCard"

interface Props {
  user: AuthPersonalAccount & { slug: string }
}

type FetchPointsHistoryResponse = AwardedPoints & {
  awardedBy: OrganizationAccount & { account: Account }
}

const fetchPointsHistory = async (slug: string) => {
  const response = await axios.get(`/api/personal/points?slug=${slug}`)
  return response.data
}

const PointsHistory = ({ user }: Props) => {
  const { data } = useQuery<FetchPointsHistoryResponse[]>(
    ["pointsHistory", user.slug],
    () => fetchPointsHistory(user.slug)
  )

  if (!data) {
    return <EmptyCard text="Loading"/>
  }

  return (
    <div className="mt-10 flex flex-col gap-4">
      {data.length > 0 ? (
        data.map((entry) => {
          return (
            <PointsHistoryItem
              key={entry.id}
              username={user.slug}
              transactionHash={entry.transactionHash}
              awardedBy={entry.awardedBy.account.slug}
              timestamp={new Date(entry.createdAt)}
              amount={entry.amount}
              reason={entry.reason}
            />
          )
        })
      ) :  (
        <EmptyCard text="No points history"/>
      )}
    </div>
  )
}

export default PointsHistory
