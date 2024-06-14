import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { Check, ExternalLink, Globe, Loader2, User } from "lucide-react";
import { Button } from "../ui/button";
import { TxtEntry, lookupTxt } from "dns-query";
import ViewTXTRecords from "@/components/adminportal/ViewTXTRecords";
import z from "zod";
import { useMutation } from "react-query";
import axios from "axios";
import { useToast } from "../ui/use-toast";
import { format } from "date-fns/format";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";

interface Props {
  domain: string;
  orgCreated: Date;
  orgId: number;
  orgWallet: string;
  orgName: string;
  orgImage: string;
  orgSlug: string;
  verificationKey: string;
  verificationAt: Date;
  refetchAllRequests: () => void;
}

const handleVerificationBody = z.object({
  orgID: z.number(),
  accept: z.boolean(),
});

const VerificationCard = (props: Props) => {
  const { toast } = useToast();
  const [TXTrecords, setTXTrecords] = useState<TxtEntry[]>();
  const handleVerificationAPI = useMutation((data: z.infer<typeof handleVerificationBody>) => {
    return axios.post("/api/admin/handleverification", data);
  });

  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "createOrganization",
    args: [props.orgWallet, props.verificationKey],
  });

  const { data, writeAsync } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    async function getDNS() {
      const { entries } = await lookupTxt(props.domain, { endpoints: ["1.1.1.1"] });
      setTXTrecords(entries);
    }

    getDNS();
  }, []);

  const handleSubmit = async (accept: boolean) => {
    try {
      if (!accept) {
        const response = await handleVerificationAPI.mutateAsync({
          orgID: props.orgId,
          accept: accept,
        });

        if (response.status !== 200) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error while updating verification request in database",
          });
        }

        props.refetchAllRequests();
        return;
      }

      if (writeAsync) {
        const writeResult = await writeAsync?.();
        if (writeResult.hash) {
          const response = await handleVerificationAPI.mutateAsync({
            orgID: props.orgId,
            accept: accept,
          });

          if (response.status !== 200) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Error while updating verification request in database",
            });
          }
        }
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Cancelled",
        description: "Verification has been cancelled",
      });
    }
  };

  return (
    <Card className="mt-4">
      <CardContent className="px-6 py-8">
        <div className="flex gap-2">
          <Avatar className="h-20 w-20 mr-4">
            <AvatarImage src={props.orgImage} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold">{props.orgName}</h3>
              <Link target="_blank" href={`/org/${props.orgSlug}`}>
                <User className="w-4 h-4 ml-2 text-gray-500" />
              </Link>
            </div>

            <div className="flex items-center mt-3 gap-6">
              <p className="text-sm p-1 rounded-sm bg-gray-200 px-2">
                Account created: {format(props.orgCreated, "dd MMM yyyy")}
              </p>
              <p className="text-sm p-1 rounded-sm bg-gray-200 px-2">
                Verification request: {format(props.verificationAt, "dd MMM yyyy")}
              </p>
              <p className="text-sm p-1 rounded-sm bg-gray-200 px-2 flex items-center gap-2">
                <Globe className="w-4 text-purple-custom" /> {props.domain}
              </p>
            </div>
            {isLoading && (
              <div className="mt-4 text-sm flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-purple-custom" /> Waiting for transaction to complete
                <Link
                  className="ml-2"
                  href={`${process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL}tx/${data?.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink width={16} className="text-gray-customlight" />
                </Link>
              </div>
            )}

            {!isLoading && isSuccess && (
              <div className="mt-4 text-sm flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-600" /> Organization has been verified on blockchain
                <Link
                  className="ml-2"
                  href={`${process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL}tx/${data?.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink width={16} className="text-gray-customlight" />
                </Link>
              </div>
            )}
            {!data && (
              <div className="flex gap-2 mt-4">
                <Button
                  className=" text-red-600  hover:bg-red-100"
                  variant={"secondary"}
                  onClick={() => handleSubmit(false)}
                >
                  Reject
                </Button>
                <Button
                  className=" text-green-600 hover:bg-green-100"
                  variant={"secondary"}
                  disabled={!writeAsync}
                  onClick={() => handleSubmit(true)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept
                </Button>
              </div>
            )}
          </div>
          <div className="ml-auto">
            {TXTrecords && <ViewTXTRecords TXTrecords={TXTrecords} verificationKey={props.verificationKey} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationCard;
