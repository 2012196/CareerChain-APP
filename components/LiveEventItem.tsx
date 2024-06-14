import React, { ReactNode } from "react";
import { Card, CardContent } from "./ui/card";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns/format";

interface Props {
    children: ReactNode
    timestamp: number
    transactionHash: string
}

const LiveEventItem = ({ children, timestamp, transactionHash }: Props) => {
  return (
    <Card className="p-3 mb-6">
      <CardContent className="pl-2 flex justify-between">
        <div className="w-full">{children}</div>
        <div className="flex gap-4 min-w-fit h-fit justify-end items-center">
          <small>{format(timestamp * 1000, "dd MMM yyyy HH:mm:ss")}</small>
          <Link
            href={`${process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL}tx/${transactionHash}`}
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
  );
};

export default LiveEventItem;
