import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { ExternalLink } from "lucide-react";
import {  SCEmployee } from "@/types/custom";
import { format } from "date-fns";
import EditEmployeeDialog from "./EditEmployeeDialog";

interface Props {
  profileName: string;
  profileImage: string | null;
  empData: SCEmployee;
  transactionHash: string;
  isEditable: boolean;
}

const EmployeeCard = (props: Props) => {
  const latestJob = props.empData.promotions[props.empData.promotions.length - 1];

  const startDate = format(Number(latestJob.startedAt) * 1000, "dd MMM yyyy");
  const endDate = Number(props.empData.endedAt) === 0 ? "-" : format(Number(latestJob.endedAt) * 1000, "dd MMM yyyy");

  return (
    <Card className="relative py-6 px-3 h-48 shadow-md">
      <CardContent className="flex gap-10">
        <Avatar className="h-20 w-20">
          <AvatarImage src={props.profileImage as string} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-lg font-semibold">{props.profileName}</p>
          <span className="text-sm mt font-semibold text-gray-customlight">
            {latestJob.position}, {latestJob.jobTitle}
          </span>
          <div className="text-xs mt-4 flex flex-col">
            <span>Started: {startDate}</span>
            <span>Ended: {endDate}</span>
          </div>
          <div>{props.isEditable && <EditEmployeeDialog SCempData={props.empData} />}</div>
        </div>
      </CardContent>
      <Link
        href={`${process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL}tx/${props.transactionHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-0 right-0 mt-2 mr-2"
      >
        <ExternalLink width={16} className="ml-2 cursor-pointer" />
      </Link>
    </Card>
  );
};

export default EmployeeCard;
