import React from "react";
import { Button } from "../ui/button";
import { View } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { TxtEntry } from "dns-query";

interface Props {
  TXTrecords: TxtEntry[];
  verificationKey: string;
}

const ViewTXTRecords = (props: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"secondary"}>
          <View className="mr-2 w-5 text-purple-custom" />
          TXT Records
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>TXT Records</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          <h3 className="text-sm text-purple-custom font-medium">Verification Key</h3>
          <div className="bg-[#1e1e1e] p-4 rounded-md text-white font-mono">
            <h3 className="text-sm font-medium">careerchain-verification={props.verificationKey}</h3>
          </div>
          <h3 className="text-sm mt-4 text-purple-custom font-medium">Records</h3>
          <code className="ml-auto text-sm bg-[#1e1e1e] rounded-md text-white p-4">
            <div>
              {props.TXTrecords.map((record) => (
                <p key={record.data}>{record.data}</p>
              ))}
            </div>
          </code>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTXTRecords;
