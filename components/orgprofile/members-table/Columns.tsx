import { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ExternalLink, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns";


export type AwardedCertColumn = {
  id: string
  awardedToImage: string
  awardedToName: string
  walletAddress: string
  transactionHash: string
  awardedAt: Date
}

export const columns: ColumnDef<AwardedCertColumn>[] = [
  {
    accessorKey: "awardedToImage",
    header: "Profile Image",
    cell: ({ row }) => {
      const image = row.getValue("awardedToImage")
      return (
        <Avatar>
          <AvatarImage src={`${window.location.origin}/${image}`} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      )
    },
  },
  {
    accessorKey: "awardedToName",
    header: "Name",
  },
  {
    accessorKey: "walletAddress",
    header: "Wallet Address",
  },
  {
    accessorKey: "awardedAt",
    header: "Awarded At",
    cell: ({ row }) => {
      const formatted = format(row.getValue("awardedAt"), "dd MMM yyyy")
      return <div>{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const awardedcert = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Link
                href={`${process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL}tx/${awardedcert.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                Open Transaction
                <ExternalLink
                  width={12}
                  className="ml-2 text-gray-customlight"
                />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
