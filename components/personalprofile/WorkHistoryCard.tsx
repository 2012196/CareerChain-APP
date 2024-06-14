import { CheckCircle, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { format } from "date-fns/format";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";
import { useContractRead } from "wagmi";
import { SCEmployee } from "@/types/custom";
import Link from "next/link";

interface Props {
  orgName: string;
  orgProfileImage: string;
  orgAddress: string;
  personalAddress: string;
  empIndex: number;
  transactionHash: string;
}

const WorkHistoryCard = (props: Props) => {
  const { data: contractData }: { data?: SCEmployee[] } = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "getOrgAllEmployee",
    args: [props.orgAddress],
  });

  const SCData =
    contractData &&
    contractData.find(
      (emp) => emp.employee === props.personalAddress && Number(emp.empIndex) === props.empIndex && !emp.active
    );

  if (!SCData) {
    return <></>;
  }

  const firstJob = SCData.promotions[0];
  const lastjob = SCData.promotions[SCData.promotions.length - 1];

  return (
    <div className="mt-5">
      <Card className="p-4">
        <CardContent className="relative flex pl-4 pt-2">
          <div className="flex gap-8">
            <Avatar className="h-24 w-24">
              <AvatarImage src={props.orgProfileImage ?? ""} alt="cur-com-logo" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="pt-0">
              <h3 className="font-semibold text-xl">{props.orgName}</h3>
              {SCData.promotions &&
                SCData.promotions.map((promotion, i) => (
                  <div key={i} className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-gray-900 rounded-full self-start mt-2" />
                    <div>
                      <div className="font-medium text-sm text-purple-custom">
                        {promotion.jobTitle}, {promotion.position}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {format(Number(promotion.startedAt) * 1000, "MMM yyyy")} -{" "}
                        {Number(promotion.endedAt) === 0
                          ? "Present"
                          : format(Number(promotion.endedAt) * 1000, "MMM yyyy")}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="text-gray-customlight absolute flex flex-row items-center right-0 top-0">
            <p className="text-gray-customlight">
              {format(Number(firstJob.startedAt) * 1000, "MMM yyyy")} -{" "}
              {format(Number(lastjob.endedAt) * 1000, "MMM yyyy")}
            </p>
          </div>
          <div className="text-gray-customlight absolute flex flex-row items-center right-0 bottom-0">
            <CheckCircle width={18} color="green" />
            <p className="ml-2 text-sm">Blockchain Verified</p>
            <Link
              className="ml-2"
              href={`${process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL}tx/${props.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink width={14} className="text-gray-customlight" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkHistoryCard;
