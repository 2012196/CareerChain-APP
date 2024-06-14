import { useState } from "react";
import { fetchUserResponse } from "../NewSearchBar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Check, Coins, ExternalLink, Loader2, X } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useDebounce } from "use-debounce";
import Link from "next/link";
import { useMutation } from "react-query";
import axios from "axios";
import { useToast } from "../ui/use-toast";
import NewSearchBar from "../NewSearchBar";

const awardPointsBody = z.object({
  transactionHash: z.string().nonempty(),
  amount: z.coerce.number().min(1),
  reason: z.string().nonempty(),
  awardedTo: z.number(),
});

const AwardPointsForm = () => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [selectedAccount, setSelectedAccount] = useState<fetchUserResponse>();
  const awardPointsAPI = useMutation((data: z.infer<typeof awardPointsBody>) => {
    return axios.post("/api/org/awardpoints", data);
  });

  const orgSCdetails: any = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "allOrganization",
    args: [session?.user.walletAddress],
  });

  const AwardPointsSchema = z.object({
    amount: z.coerce
      .number()
      .min(1)
      .max((orgSCdetails.data && Number(orgSCdetails.data[2])) || 999),
    reason: z.string().nonempty("Please provide a reason"),
  });

  const form = useForm<z.infer<typeof AwardPointsSchema>>({
    resolver: zodResolver(AwardPointsSchema),
  });

  const formWatcher = form.watch(["amount", "reason"]);
  const debouncedReason = useDebounce(formWatcher[1], 500);
  const debouncedAmount = useDebounce(formWatcher[0], 500);

  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "awardPoints",
    args: [selectedAccount?.walletAddress, debouncedAmount[0], debouncedReason[0]],
  });

  const { data, writeAsync } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  async function onSubmit(values: z.infer<typeof AwardPointsSchema>) {
    try {
      const writeResult = await writeAsync?.();
      if (writeResult?.hash) {
        const res = await awardPointsAPI.mutateAsync({
          amount: values.amount,
          reason: values.reason,
          transactionHash: writeResult.hash,
          awardedTo: selectedAccount?.PersonalAccount.id as number,
        });
        if (res.status !== 200) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error while adding awarded points to database",
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div>
      <Card className="w-fit px-6 py-3">
        <CardContent>
          <div className="flex gap-2 items-center">
            <Coins />
            <h3 className="font-semibold text-sm">Available Points</h3>
          </div>
          <h2 className="text-3xl font-semibold mt-2 mx-auto text-purple-custom">
            {orgSCdetails.data && Number(orgSCdetails.data[2])}
          </h2>
        </CardContent>
      </Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-3">
          <FormItem>
            <FormLabel>Account</FormLabel>
          </FormItem>
          {selectedAccount ? (
            <div className="flex items-center justify-center py-3 px-4 rounded-lg w-fit text-xs border border-gray-customlight">
              <Avatar className="h-7 w-7 mr-4">
                <AvatarImage src={selectedAccount.profileImage as string} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p>{selectedAccount.PersonalAccount.name}</p>
              <X className="w-3 h-3 ml-3 cursor-pointer" onClick={() => setSelectedAccount(undefined)} />
            </div>
          ) : (
            <NewSearchBar includeOnly="personal" handleSelection={(user) => setSelectedAccount(user)} />
          )}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Amount of points"
                    {...field}
                    type="number"
                    min="1"
                    max={orgSCdetails.data && Number(orgSCdetails.data[2])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason</FormLabel>
                <FormControl>
                  <Textarea placeholder="Reason for awarding" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isLoading && (
            <div className="mt-4 text-sm flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-purple-custom" /> Waiting for transaction to complete
              <Link
                className="ml-2"
                href={`${process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL}tx/${data?.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink width={12} className="text-gray-customlight" />
              </Link>
            </div>
          )}
          {!isLoading && isSuccess && (
            <div className="mt-4 text-sm flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" /> Points has been awarded
              <Link
                className="ml-2"
                href={`${process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL}tx/${data?.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink width={12} className="text-gray-customlight" />
              </Link>
            </div>
          )}
          {!data && (
            <Button type="submit" disabled={!writeAsync}>
              Confirm
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
};

export default AwardPointsForm;
