import { AuthPersonalAccount, FetchEmployeementResponse, SCCertificate, SCEmployee, SCPersonal } from "@/types/custom";
import AboutMe from "./AboutMe";
import CertificationsCard from "./CertificationsCard";
import WorkExperienceCard from "./WorkExperienceCard";
import { useContractRead } from "wagmi";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";
import { Account, AwardedCertificate, OrganizationAccount } from "@prisma/client";
import { useQuery } from "react-query";
import axios from "axios";
import EmptyCard from "../EmptyCard";

interface Props {
  user: AuthPersonalAccount & { isSelf: boolean; slug: string };
}

type FetchCertificatesResponse = AwardedCertificate & {
  awardedBy: OrganizationAccount & { account: Account };
};

const fetchCertificates = async (slug: string) => {
  const response = await axios.get(`/api/org/awardcertificate?type=personal&slug=${slug}`);
  return response.data;
};

const fetchEmployement = async (slug: string) => {
  const response = await axios.get(`/api/personal/employement?slug=${slug}`);
  return response.data;
};

const Showcase = (props: Props) => {
  const { data }: { data?: SCCertificate[] } = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "getPersonalAllCertificates",
    args: [props.user.wallet_address],
  });

  const { data: SCpersonalData }: { data?: SCPersonal } = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "allPersonal",
    args: [props.user.wallet_address],
  });

  const { data: SCOrgEmployees }: { data?: SCEmployee[] } = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "getOrgAllEmployee",
    args: [SCpersonalData && SCpersonalData[0]],
  });

  const { data: dbData } = useQuery<FetchCertificatesResponse[]>(["personalCertificates", props.user.slug], () =>
    fetchCertificates(props.user.slug)
  );

  const { data: EmpDbData } = useQuery<FetchEmployeementResponse[]>(["personalEmployement", props.user.slug], () =>
    fetchEmployement(props.user.slug)
  );


  const SCcurEmployement =
    SCOrgEmployees && SCOrgEmployees.find((emp) => emp.employee === props.user.wallet_address && emp.active);
  const curEmployement = EmpDbData?.find((emp) => emp.orgAddress === SCcurEmployement?.employer);

  return (
    <section className="mt-8">
      <AboutMe aboutMe={props.user.aboutMe as string} isEditable={props.user.isSelf} />
      <div className="mt-8">
        <h2 className="font-semibold text-lg">Current Employement</h2>
        <div className="mt-4">
          {curEmployement ? (
            SCcurEmployement && (
              <WorkExperienceCard
                companyLogo={curEmployement?.orgProfileImage}
                companyName={curEmployement.orgName}
                startDate={Number(SCcurEmployement.startedAt) * 1000}
                transactionHash={curEmployement.transactionHash}
                promotions={SCcurEmployement.promotions}
              />
            )
          ) : (
            <EmptyCard text="No current employement" />
          )}
        </div>
      </div>
      <h2 className="font-semibold text-lg mt-8">Certifications</h2>
      <div className="flex flex-col space-y-4">
        {data && data.length <= 0 ? (
          <div className="mt-4">
            <EmptyCard text="No certifications" />
          </div>
        ) : (
          data &&
          dbData &&
          data.map((cert, index) => {
            const dbEntry = dbData.find(
              (res) => res.createdBy === cert.createdBy && res.orgCertId === parseInt(cert.certIndex)
            );
            return (
              dbEntry && (
                <CertificationsCard
                  key={index}
                  title={cert.name}
                  orgLogo={dbEntry?.awardedBy.account.profileImage as string}
                  description={cert.description}
                  imageHash={cert.imageHash}
                  transactionHash={dbEntry?.transactionHash}
                  createdAt={dbEntry.createdAt}
                />
              )
            );
          })
        )}
      </div>
    </section>
  );
};

export default Showcase;
