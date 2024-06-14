import { z } from "zod";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Check, ExternalLink, Loader2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";
import { useDebounce } from "use-debounce";
import { useMutation } from "react-query";
import axios from "axios";
import { toast } from "../ui/use-toast";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import AddPromotionForm from "./AddPromotionForm";
import { EmployeePromotions } from "@/types/custom";
import { Card, CardContent } from "../ui/card";



interface Props {
  empIndex: number;
  startDate: number;
  endDate: number;
  promotions: EmployeePromotions[];
}

const EditEmployeeformSchema = z.object({
  endDate: z.date().optional(),
  startDate: z.date({
    required_error: "A start date is required.",
  }),
});

const editEmpBody = z.object({
  transactionHash: z.string().nonempty(),
  empIndex: z.number(),
});

const EditEmployeeForm = (props: Props) => {
  const editEmp = useMutation((data: z.infer<typeof editEmpBody>) => {
    return axios.post("/api/org/editemployee", data);
  });

  const form = useForm<z.infer<typeof EditEmployeeformSchema>>({
    resolver: zodResolver(EditEmployeeformSchema),
  });

  useEffect(() => {

    form.setValue("startDate", new Date(props.startDate));
    if (props.endDate === 0) {
      form.setValue("endDate", undefined);
    } else {
      form.setValue("endDate", new Date(props.endDate));
    }
  }, []);

  const formWatcher = form.watch(["endDate"]);
  const debouncedEndDate = useDebounce<Date | undefined>(formWatcher[0], 500);

  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "editEmployee",
    args: [
      props.empIndex,
      debouncedEndDate[0] ? Math.floor(debouncedEndDate[0].getTime() / 1000) : 0,
    ],
  });

  const { data, writeAsync } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  async function onSubmit(values: z.infer<typeof EditEmployeeformSchema>) {
    try {
      const writeResult = await writeAsync?.();
      if (writeResult?.hash) {
        const res = await editEmp.mutateAsync({
          transactionHash: writeResult.hash,
          empIndex: props.empIndex,
        });
        console.log(res);
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
          <div className="flex justify-between">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Button
                      disabled={true}
                      variant={"outline"}
                      className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP") : <span></span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
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
                        disabled={(date) => date > new Date() || date <= form.getValues("startDate")}
                        initialFocus
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
              <Check className="mr-2 h-4 w-4 text-green-600" /> Employee has been edited
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
              Update
            </Button>
          )}
        </form>
      </Form>
      <div className="mt-9">
        <div className="font-semibold mb-2">Promotions</div>

        {props.promotions &&
          props.promotions.map((prom, i) => {
            return (
              <Card key={i} className="mt-2 px-2 py-3">
                <CardContent className="flex items-center justify-between">
                  <div className="text-purple-custom font-semibold">
                    {prom.position}, {prom.jobTitle}
                  </div>
                  <div className="text-sm">
                    {format(Number(prom.startedAt) * 1000, "MMM yyyy")} -{" "}
                    {Number(prom.endedAt) === 0 ? "Present" : format(Number(prom.endedAt) * 1000, "MMM yyyy")}
                  </div>
                </CardContent>
              </Card>
            );
          })}

        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-3 w-full p-0 px-2">Add Promotion</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Promotion</DialogTitle>
              <DialogDescription>Add a new milestone for this person</DialogDescription>
            </DialogHeader>
            <AddPromotionForm empIndex={props.empIndex} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EditEmployeeForm;
