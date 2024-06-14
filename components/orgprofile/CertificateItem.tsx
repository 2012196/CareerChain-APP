import { ExternalLink, Eye, Users2 } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import Link from "next/link"
import { SCCertificate } from "@/types/custom"
import AwardCertificateDialog from "./AwardCertificateDialog"

interface Props {
  certData: SCCertificate
  transactionHash: string
  isEditable: boolean
}

const CertificateItem = (props: Props) => {
  return (
    <div>
      <Card className="py-4 px-3 w-80 h-48 shadow-md">
        <CardContent className="flex flex-col h-full">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-base">{props.certData.name}</h3>
            <Link
              href={`${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/${props.certData.imageHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant={"secondary"} className="p-2 h-7">
                <Eye width={14} />
              </Button>
            </Link>
          </div>
          <Link
            href={`${process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL}tx/${props.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <small className="text-gray-customlight flex items-center gap-1 cursor-pointer">
              View transaction <ExternalLink width={12} />
            </small>
          </Link>
          <p className="mt-2 text-sm overflow-hidden text-ellipsis">
            {props.certData.description}
            {/* <p>Total Awarded: 10</p> */}
          </p>
          <div className="mt-auto justify-between flex flex-row gap-2">
            <Link
              href={`${window.location.pathname}/members?orgAddress=${props.certData.createdBy}&certId=${props.certData.certIndex}`}
            >
              <Button className="p-0 px-2 text-xs" variant={"secondary"}>
                <Users2 width={16} className="mr-2" />
                View members
              </Button>
            </Link>
            {props.isEditable && (
              <AwardCertificateDialog certData={props.certData} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CertificateItem
