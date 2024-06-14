import { Card, CardContent } from "../ui/card"
import { CheckCircle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { format } from "date-fns";

interface Props {
  orgLogo: string
  title: string
  description: string
  imageHash: string
  transactionHash: string
  createdAt: Date
}

const CertificationsCard = (props: Props) => {

  return (
    <div className="mt-5">
      <Card className="p-4">
        <CardContent className="relative pl-4 py-2">
          <div className="flex items-start justify-between w-full">
            <div className="flex gap-8">
              <Avatar className="h-20 w-20">
                <AvatarImage src={props.orgLogo} alt="org-cert-logo" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="pt-0">
                <h3 className="font-bold text-xl">{props.title}</h3>
                <p className="text-gray-customlight text-sm">{format(props.createdAt, "dd MMM yyyy")}</p>
                <p className="mt-4 max-w-4xl">{props.description}</p>
              </div>
            </div>
            <Link
              href={`${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/${props.imageHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="text-purple-custom/80 cursor-pointer font-semibold text-sm">
                View Credentials
              </div>
            </Link>
          </div>
          <div className="text-gray-customlight absolute flex flex-row items-center bottom-0 right-0">
            <CheckCircle width={18} color="green" />
            <p className="ml-2">Blockchain Verified</p>
            <Link
              href={`${process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL}tx/${props.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink width={16} className="ml-2 cursor-pointer" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CertificationsCard
