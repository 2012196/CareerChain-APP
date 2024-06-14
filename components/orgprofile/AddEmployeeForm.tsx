import { z } from "zod";
import NewSearchBar, { fetchUserResponse } from "../NewSearchBar";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Check, ExternalLink, Loader2, X } from "lucide-react";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";
import { useDebounce } from "use-debounce";
import { useMutation } from "react-query";
import axios from "axios";
import { toast } from "../ui/use-toast";
import Link from "next/link";
import { SCEmployee } from "@/types/custom";

interface Props {
  empIndex: number;
  walletAddress: string;
}

const AddEmployeeformSchema = z.object({
  empJobTile: z.string().nonempty("Please provide a job title for this employee"),
  empJobPosition: z.string().nonempty("Please provide a job position for this employee"),
  startDate: z.date({
    required_error: "A start date is required.",
  }),
  endDate: z.date().optional(),
});

const createEmpBody = z.object({
  transactionHash: z.string().nonempty(),
  personalID: z.number(),
  empIndex: z.number(),
});

const AddEmployeeForm = (props: Props) => {
  const createEmp = useMutation((data: z.infer<typeof createEmpBody>) => {
    return axios.post("/api/org/employee", data);
  });

  const [selectedAccount, setSelectedAccount] = useState<fetchUserResponse>();

  const form = useForm<z.infer<typeof AddEmployeeformSchema>>({
    resolver: zodResolver(AddEmployeeformSchema),
  });

  const formWatcher = form.watch(["empJobPosition", "empJobTile", "startDate", "endDate"]);
  const debouncedJobPosition = useDebounce(formWatcher[0], 500);
  const debouncedJobTitle = useDebounce(formWatcher[1], 500);
  const debouncedStartDate = useDebounce<Date>(formWatcher[2], 500);
  const debouncedEndDate = useDebounce<Date | undefined>(formWatcher[3], 500);

  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "addEmployee",
    args: [
      selectedAccount?.walletAddress,
      debouncedJobTitle[0],
      debouncedJobPosition[0],
      Math.floor(debouncedStartDate[0]?.getTime() / 1000),
      debouncedEndDate[0] ? Math.floor(debouncedEndDate[0].getTime() / 1000) : 0,
    ],
  });

  const { data, writeAsync } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const { data: existingEmployeeSC }: { data?: SCEmployee[] } = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "getOrgAllEmployee",
    args: [props.walletAddress],
  });

  async function onSubmit(values: z.infer<typeof AddEmployeeformSchema>) {
    try {
      const writeResult = await writeAsync?.();
      if (writeResult?.hash) {
        const res = await createEmp.mutateAsync({
          transactionHash: writeResult.hash,
          personalID: selectedAccount?.PersonalAccount.id as number,
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
            <NewSearchBar
              includeOnly="personal"
              handleSelection={(user) => setSelectedAccount(user)}
              filter={(user) => !existingEmployeeSC?.some((emp) => emp.employee === user.walletAddress)}
            />
          )}
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
          <div className="flex justify-between">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a start date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown-buttons"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1970-01-01")}
                        fromYear={1970}
                        toYear={2024}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a end date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown-buttons"
                        selected={field.value as Date}
                        onSelect={field.onChange}
                        initialFocus
                        fromYear={1970}
                        toYear={2024}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                <ExternalLink width={12} className="text-gray-customlight" />
              </Link>
            </div>
          )}
          {!isLoading && isSuccess && (
            <div className="mt-4 text-sm flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-600" /> Employee has been added in smart contract
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

export default AddEmployeeForm;
