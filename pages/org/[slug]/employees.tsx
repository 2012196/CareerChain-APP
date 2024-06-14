import AddEmployeeDialog from "@/components/orgprofile/AddEmployeeDialog";
import EmployeeCard from "@/components/orgprofile/EmployeeCard";
import { Input } from "@/components/ui/input";
import { useContractRead } from "wagmi";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";
import { FetchEmployeesResponse, SCEmployee } from "@/types/custom";
import axios from "axios";
import { useQuery } from "react-query";
import ClientOnly from "@/components/ClientOnly";
import { useState } from "react";
import { GetServerSideProps } from "next/types";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Button } from "@/components/ui/button";

interface Props {
  slug: string;
  walletAddress: string;
  isEditable: boolean;
}

const fetchOrgEmployees = async (slug: string) => {
  const response = await axios.get(`/api/org/employee?slug=${slug}`);
  return response.data;
};

const Employees = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: contractData }: { data?: SCEmployee[] } = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "getOrgAllEmployee",
    args: [props.walletAddress],
    watch: true,
  });

  const orgSCdetails: any = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "allOrganization",
    args: [props.walletAddress],
    watch: true,
  });

  const planID = Number(orgSCdetails.data[4]);

  const { data: dbData } = useQuery<FetchEmployeesResponse[]>(["orgAllEmployee", props.slug], () =>
    fetchOrgEmployees(props.slug)
  );

  return (
    <div className="max-container mt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl">All Employees</h2>
        {props.isEditable &&
          dbData &&
          planID !== null &&
          (planID === 0 && dbData.length >= 2 ? (
            <Button disabled={true} variant={"destructive"}>
              Limit Reached
            </Button>
          ) : (
            <AddEmployeeDialog walletAddress={props.walletAddress} />
          ))}
      </div>
      <ClientOnly>
        <div className="mt-10 grid grid-cols-4 gap-4">
          <Input
            className="w-full col-span-4"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {contractData && dbData ? (
            contractData.map((emp, i) => {
              const dbEntry = dbData.find(
                (dbEmp) => dbEmp.personalAddress === emp.employee && dbEmp.empIndex === Number(emp.empIndex)
              );

              if (dbEntry?.profileName.toLowerCase().includes(searchTerm.toLowerCase())) {
                return (
                  <EmployeeCard
                    key={i}
                    empData={emp}
                    isEditable={props.isEditable}
                    transactionHash={dbEntry?.transactionHash as string}
                    profileImage={dbEntry?.profileImage}
                    profileName={dbEntry?.profileName as string}
                  />
                );
              }
            })
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </ClientOnly>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const { slug } = query;
  const session = await getServerSession(req, res, authOptions);

  const org = await prisma.account.findUnique({
    where: {
      slug: slug as string,
    },
  });

  if (org) {
    return {
      props: {
        slug: slug,
        walletAddress: org.walletAddress,
        isEditable: session?.user.slug === slug,
      },
    };
  }

  return {
    props: {},
  };
};

export default Employees;
