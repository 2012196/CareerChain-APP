import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import AddEmployeeForm from "./AddEmployeeForm";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";
import { useContractRead } from "wagmi";

interface Props {
  walletAddress: string;
}

const AddEmployeeDialog = (props: Props) => {
  const { data: contractData }: { data?: any } = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "allOrganization",
    args: [props.walletAddress],
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" width={18} />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>Add a new employee in the blockchain for your organization.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {contractData && <AddEmployeeForm empIndex={Number(contractData[0])} walletAddress={props.walletAddress} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
