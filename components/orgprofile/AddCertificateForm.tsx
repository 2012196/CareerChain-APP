import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { FileUploader } from "react-drag-drop-files";
import { useState } from "react";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import { useMutation } from "react-query";
import axios from "axios";
import { usePrepareContractWrite, useContractWrite, useContractRead, useWaitForTransaction } from "wagmi";
import { useDebounce } from "use-debounce";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useToast } from "../ui/use-toast";

const AddCertificateformSchema = z.object({
  certName: z.string().nonempty("Certification name is required"),
  certDescription: z.string().nonempty("Please provide a short description for this certificate"),
});

const createCertificateBody = z.object({
  transactionHash: z.string().nonempty(),
  orgCertID: z.number(),
});

const AddCertificateForm = () => {
  const [file, setFile] = useState<File>();
  const [IPFSHash, setIPFSHash] = useState<String>();
  const { data: session } = useSession();
  const { toast } = useToast();

  const { mutateAsync: uploadImageToIPFS, isLoading: isFileUploading } = useMutation((data: FormData) => {
    return axios.post("/api/common/uploadIPFS", data);
  });

  const createCertificate = useMutation((data: z.infer<typeof createCertificateBody>) => {
    return axios.post("/api/org/certificate", data);
  });

  const handleFileChange = async (newFile: File) => {
    setFile(newFile);
    const body = new FormData();
    body.append("document", newFile);
    const response = await uploadImageToIPFS(body);
    if (response.status === 200) {
      setIPFSHash(response.data.ipfsHash);
    }
  };

  const form = useForm<z.infer<typeof AddCertificateformSchema>>({
    resolver: zodResolver(AddCertificateformSchema),
  });

  const certDetailsWatcher = form.watch(["certName", "certDescription"]);
  const debouncedcertDescription = useDebounce(certDetailsWatcher[1], 500);
  const debouncedcertName = useDebounce(certDetailsWatcher[0], 500);

  const orgSCdetails: any = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "allOrganization",
    args: [session?.user.walletAddress],
  });

  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "createCertificate",
    args: [debouncedcertName[0], debouncedcertDescription[0], IPFSHash],
  });

  const { data, writeAsync } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  async function onSubmit(values: z.infer<typeof AddCertificateformSchema>) {
    if (writeAsync) {
      try {
        const writeResult = await writeAsync?.();
        if (writeResult.hash) {
          const res = await createCertificate.mutateAsync({
            transactionHash: writeResult.hash,
            orgCertID: parseInt(orgSCdetails.data[0]),
          });
          if (res.status !== 200) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Error while adding certificate",
            });
          }
        }
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Cancelled",
          description: "Adding certificate has been cancelled",
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="certName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certificate name</FormLabel>
              <FormControl>
                <Input placeholder="New certificate" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="certDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Type description here" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Upload Image</FormLabel>
        </FormItem>
        {file && !isFileUploading && (
          <div className="flex justify-between">
            <p className="font-semibold text-sm text-purple-custom">{file?.name}</p>
            <X className="text-gray-customlight cursor-pointer" width={16} onClick={() => setFile(undefined)} />
          </div>
        )}
        {isFileUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileUploader
            label="Upload your certificate image here"
            handleChange={handleFileChange}
            name="file"
            types={["JPG", "PNG", "PDF"]}
          />
        )}
        <Button type="submit" disabled={!file || !writeAsync || isLoading || isFileUploading}>
          Add
        </Button>
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
            <Check className="mr-2 h-4 w-4 text-green-600" /> Certificate has been added
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
      </form>
    </Form>
  );
};

export default AddCertificateForm;
