import { AuthPersonalAccount, FetchEmployeementResponse } from "@/types/custom";
import axios from "axios";
import { useQuery } from "react-query";
import WorkHistoryCard from "./WorkHistoryCard";
import EmptyCard from "../EmptyCard";

interface Props {
  user: AuthPersonalAccount & { slug: string };
}

const fetchEmployement = async (slug: string) => {
  const response = await axios.get(`/api/personal/employement?slug=${slug}`);
  return response.data;
};

const EmployementHistory = (props: Props) => {
  const { data: dbData } = useQuery<FetchEmployeementResponse[]>(["personalEmployement", props.user.slug], () =>
    fetchEmployement(props.user.slug)
  );

  return (
    <div className="mt-10">
      {dbData &&
        dbData.map((employeement, i) => (
          <WorkHistoryCard
            key={i}
            empIndex={employeement.employementIndex}
            orgAddress={employeement.orgAddress}
            personalAddress={props.user.wallet_address}
            orgName={employeement.orgName}
            orgProfileImage={employeement.orgProfileImage ?? ""}
            transactionHash={employeement.transactionHash}
          />
        ))}
    </div>
  );
};

export default EmployementHistory;
