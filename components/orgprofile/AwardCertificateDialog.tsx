import {
  Briefcase,
  Check,
  ExternalLink,
  FileBadge,
  Loader2,
  X,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { useEffect, useState } from "react"
import axios from "axios"
import { useMutation } from "react-query"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Card } from "../ui/card"
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json"
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi"
import { SCCertificate } from "@/types/custom"
import Link from "next/link"
import { z } from "zod"
import { useToast } from "../ui/use-toast"
import  NewSearchBar, { fetchUserResponse } from "../NewSearchBar"

interface Props {
  certData: SCCertificate
}

const awardCertificateBody = z.object({
  transactionHash: z.string().nonempty(),
  orgCertID: z.number(),
  personalID: z.number(),
})

const AwardCertificateDialog = (props: Props) => {
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<fetchUserResponse>()
  const awardCertificateAPI = useMutation(
    (data: z.infer<typeof awardCertificateBody>) => {
      return axios.post("/api/org/awardcertificate", data)
    }
  )

  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "awardCertificate",
    args: [parseInt(props.certData.certIndex), selectedAccount?.walletAddress],
  })

  const { data, writeAsync } = useContractWrite(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const handleSubmit = async () => {
    try {
      if (writeAsync) {
        const writeResult = await writeAsync?.()
        if (writeResult.hash) {
          const res = await awardCertificateAPI.mutateAsync({
            personalID: selectedAccount?.PersonalAccount.id as number,
            transactionHash: writeResult.hash,
            orgCertID: parseInt(props.certData.certIndex),
          })
          if (res.status !== 200) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Error while adding awarded certificate to database",
            })
          }
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    setSelectedAccount(undefined)
  }, [dialogOpen])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="p-0 px-2 text-xs">
          <FileBadge width={16} className="mr-2" /> Award Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>Award Certificate</DialogTitle>
          <DialogDescription>Select profile to award</DialogDescription>
        </DialogHeader>
        <NewSearchBar
          includeOnly="personal"
          handleSelection={(user) => setSelectedAccount(user)}
          filter={(user) =>
            !props.certData.awardedTo.includes(user.walletAddress)
          }
        />
        <div className="mt-4">
          {selectedAccount && (
            <Card className="p-5 flex relative">
              <div className="absolute top-0 right-0 mt-2 mr-2">
                <X
                  className="w-4 h-4 text-gray-customlight cursor-pointer"
                  onClick={() => setSelectedAccount(undefined)}
                />
              </div>
              <Avatar className="h-20 w-20 mr-4">
                <AvatarImage src={selectedAccount.profileImage as string} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <div className="flex gap-2 items-center">
                  <p className="font-semibold">
                    {selectedAccount.PersonalAccount.name}
                  </p>
                  <small className="text-gray-customlight">
                    @{selectedAccount.slug}
                  </small>
                </div>
                <small className="flex items-center gap-1 mt-1">
                  <Briefcase className="w-4 text-purple-custom" />
                  {selectedAccount.PersonalAccount.job_title}
                </small>

                {isLoading && (
                  <div className="mt-4 text-sm flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-purple-custom" />{" "}
                    Waiting for transaction to complete
                    <Link
                      className="ml-2"
                      href={`${process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL}tx/${data?.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink
                        width={12}
                        className="text-gray-customlight"
                      />
                    </Link>
                  </div>
                )}

                {!isLoading && isSuccess && (
                  <div className="mt-4 text-sm flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />{" "}
                    Certificate has been awarded
                    <Link
                      className="ml-2"
                      href={`${process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL}tx/${data?.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink
                        width={12}
                        className="text-gray-customlight"
                      />
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="submit"
            disabled={!selectedAccount || !writeAsync || isLoading}
            onClick={handleSubmit}
          >
            Award
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AwardCertificateDialog
