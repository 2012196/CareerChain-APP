import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bitcoin, Check } from "lucide-react";
import axios from "axios";
import { useQuery } from "react-query";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";
import { parseEther } from "viem";
import { Loader2 } from "lucide-react";

interface Props {
  planID: number;
  planName: string;
  planDescription: string;
  planPrice: string;
  planPoints: string;
  planDuration: string;
}

const fetchEthAmount = async (usd: string) => {
  const response = await axios.get(`/api/common/getEthAmount?amount=${usd}&from=USD&to=ETH`);
  return response.data;
};

const PlanCard = (props: Props) => {
  const { data: ethAmount } = useQuery(["plan", props.planID], () => fetchEthAmount(props.planPrice), {
    refetchOnWindowFocus: false,
  });

  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "buySubscription",
    args: [props.planID],
    value: ethAmount && parseEther(ethAmount.ETH.price.toString()),
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <h3 className="text-2xl font-bold">{props.planName}</h3>
        <p className="text-gray-500 ">{props.planDescription}</p>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold">${props.planPrice}</span>
          <span className="text-gray-500 ">/{props.planDuration} month</span>
        </div>
        <ul className="space-y-2 text-gray-500 ">
          <li className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            {props.planPoints} points
          </li>
          <li className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            More than 5 employees
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={!write || isLoading} onClick={write}>
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <div className="flex items-center">
              <Bitcoin width={20} className="mr-2" /> Pay with crypto
            </div>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
