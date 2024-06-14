import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useMutation, useQuery } from "react-query";
import axios from "axios";
import { VerificationRequest } from "@prisma/client";
import { useToast } from "../ui/use-toast";

const getVerificationStatus = async () => {
  const response = await axios.get("/api/org/verificationrequest");
  return response.data;
};

const VerifyOrgButton = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const createVerificationAPI = useMutation(() => {
    return axios.post("/api/org/verificationrequest");
  });
  const { data, refetch: refetchVerificationStatus } = useQuery<VerificationRequest>([], getVerificationStatus);

  const handleSubmit = async () => {
    const res = await createVerificationAPI.mutateAsync();
    if (res.status !== 200) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error while adding verification request",
      });
    }
    refetchVerificationStatus();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="text-xs bg-green-200 p-1 rounded border border-dotted border-green-400 cursor-pointer">
          Verify Now
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[580px] min-h-[180px]">
        <DialogHeader>
          <DialogTitle>Verify Organization</DialogTitle>
          <DialogDescription>Verify your organization on blockchain</DialogDescription>
        </DialogHeader>
        {data ? (
          <div>
            <p className="font-semibold">
              Please add this verification key to your domain DNS <span className="text-purple-custom">TXT</span>{" "}
              records.
            </p>
            <div className="bg-[#1e1e1e] p-4 rounded-md text-white font-mono mt-4">
              <h3 className="text-sm font-medium">careerchain-verification={data.verificationKey}</h3>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-4 justify-center items-center">
            <h3 className="font-semibold text-center">Are you sure you want to send verification requests ?</h3>
            <div className="flex items-center gap-4 mt-6">
              <Button className="w-16" onClick={() => handleSubmit()}>
                Yes
              </Button>
              <Button className="w-16" onClick={() => setOpen(false)}>
                No
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VerifyOrgButton;
