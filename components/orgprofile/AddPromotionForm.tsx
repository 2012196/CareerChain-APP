import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {  Check, ExternalLink, Loader2, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";
import { useDebounce } from "use-debounce";
import { useMutation } from "react-query";
import axios from "axios";
import { toast } from "../ui/use-toast";
import Link from "next/link";

interface Props {
  empIndex: number;
}

const AddPromotionFormSchema = z.object({
  empJobTile: z.string().nonempty("Please provide a job title for this employee"),
  empJobPosition: z.string().nonempty("Please provide a job position for this employee"),
});

const editEmpBody = z.object({
  transactionHash: z.string().nonempty(),
  empIndex: z.number(),
});

const AddPromotionForm = (props: Props) => {
  const editEmp = useMutation((data: z.infer<typeof editEmpBody>) => {
    return axios.post("/api/org/editemployee", data);
  });

  const form = useForm<z.infer<typeof AddPromotionFormSchema>>({
    resolver: zodResolver(AddPromotionFormSchema),
  });


  const formWatcher = form.watch(["empJobPosition", "empJobTile"]);
  const debouncedJobPosition = useDebounce(formWatcher[0], 500);
  const debouncedJobTitle = useDebounce(formWatcher[1], 500);

  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "addPromotion",
    args: [
      props.empIndex,
      debouncedJobTitle[0],
      debouncedJobPosition[0],
    ],
  });

  const { data, writeAsync } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  async function onSubmit(values: z.infer<typeof AddPromotionFormSchema>) {
    try {
      const writeResult = await writeAsync?.();
      if (writeResult?.hash) {
        const res = await editEmp.mutateAsync({
          transactionHash: writeResult.hash,
          empIndex: props.empIndex,
        });
        if (res.status !== 200) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error while adding employee to database",
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-3">
          <FormField
            control={form.control}
            name="empJobTile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job title</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="empJobPosition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Position</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
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
              <Check className="mr-2 h-4 w-4 text-green-600" /> Promotion has been added
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
            <Button className="mt-2" type="submit" disabled={!writeAsync}>
              Add
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
};

export default AddPromotionForm;
