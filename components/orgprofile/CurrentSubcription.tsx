import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";
import { useContractRead } from "wagmi";
import { useSession } from "next-auth/react";
import { format } from "date-fns/format";

const CurrentSubcription = () => {
  const { data: session } = useSession();
  const [activePlan, setActivePlan] = useState("");

  const orgSCdetails: any = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "allOrganization",
    args: [session?.user.walletAddress],
    watch: true 
  });

  useEffect(() => {
    if (!orgSCdetails.data) {
      return;
    }
    const planID = Number(orgSCdetails.data[4]);

    if (planID === 1) {
      setActivePlan("Starter");
    } else if (planID === 2) {
      setActivePlan("Pro");
    } else if (planID === 3) {
      setActivePlan("Enterprise");
    }
  }, [orgSCdetails]);

  if (orgSCdetails.data && Number(orgSCdetails.data[4]) === 0) {
    return;
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gray-100 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Your Subscription</h1>
        </div>
      </CardHeader>
      <CardContent className="p-6 grid gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{activePlan}</h2>
            <div className="text-xs bg-green-300 px-2 py-1 rounded-md">Active</div>
          </div>
          <p className="text-gray-500 text-base">Our most popular subscription plan for growing businesses.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Expires</h3>
          <div className="text-gray-500 ">
            {orgSCdetails.data && format(new Date(Number(orgSCdetails.data[5]) * 1000), "MMM dd, yyyy")}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-100 p-8 flex items-center justify-between"></CardFooter>
    </Card>
  );
};

export default CurrentSubcription;
