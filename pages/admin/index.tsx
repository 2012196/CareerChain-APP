import React, { useEffect, useState } from "react";
import { Account, OrganizationAccount, VerificationRequest } from "@prisma/client";
import VerificationCard from "@/components/adminportal/VerificationCard";
import axios from "axios";
import { useQuery } from "react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBalance, useContractWrite, usePrepareContractWrite } from "wagmi";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";

type allVerificationRequests = (VerificationRequest & {
  OrganizationAccount: OrganizationAccount & { account: Account };
})[];

const fetchVerifications = async () => {
  const response = await axios.get("/api/admin/handleverification");
  return response.data;
};

const fetchUSDAmount = async (eth: string) => {
  const response = await axios.get(`/api/common/getEthAmount?amount=${eth}&from=ETH&to=USD`);
  return response.data;
};

const Admin = () => {
  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "withdraw",
  });

  const { write: withdrawAll } = useContractWrite(config);

  const { data, refetch } = useQuery<allVerificationRequests>("allVerificationRequests", () => fetchVerifications());
  const [ethAmount, setEthAmount] = useState("0");
  const { data: balance } = useBalance({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`
  });

  const { data: usdAmount, refetch: refetchUSDAmount } = useQuery(
    ["contractBalance"],
    () => fetchUSDAmount(ethAmount),
    {
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );

  useEffect(() => {
    if (balance) {
      setEthAmount(balance.formatted);
    }
  }, [balance]);

  useEffect(() => {
    if (ethAmount !== "0") {
      refetchUSDAmount();
    }
  }, [ethAmount, refetchUSDAmount]);

  return (
    <div className="max-container mt-10">
      <section>
        <h1 className="font-semibold text-xl">Smart Contract</h1>
        <div className="grid grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-custom text-lg">Contract Balance</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="text-gray-500 ">SEP-ETH</div>
                <div className="font-semibold">{ethAmount}</div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-gray-500 ">USD</div>
                <div className="font-semibold">${usdAmount ? usdAmount.USD.price.toFixed(3) : 0}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-custom text-lg">Contract Address</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-2">
              <div className="text-gray-500">Address</div>
              <div className="font-semibold mt-2">{process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA}</div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-4">
          <Button disabled={!withdrawAll || ethAmount === "0"} onClick={withdrawAll}>
            Withdraw Funds
          </Button>
        </div>
      </section>

      <div className="mt-10">
        <h3 className="font-semibold text-lg">Organization Verification Requests</h3>
        {data &&
          data.map((verReq) => (
            <VerificationCard
              key={verReq.orgId}
              orgId={verReq.orgId}
              orgWallet={verReq.OrganizationAccount.account.walletAddress}
              orgCreated={verReq.OrganizationAccount.account.createdAt}
              verificationKey={verReq.verificationKey}
              verificationAt={verReq.createdAt}
              domain={verReq.OrganizationAccount.website}
              orgName={verReq.OrganizationAccount.name}
              orgSlug={verReq.OrganizationAccount.account.slug}
              orgImage={verReq.OrganizationAccount.account.profileImage || ""}
              refetchAllRequests={refetch}
            />
          ))}
      </div>
    </div>
  );
};

export default Admin;
