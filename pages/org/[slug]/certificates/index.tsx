import AddCertificateDialog from "@/components/orgprofile/AddCertificateDialog";
import CertificateItem from "@/components/orgprofile/CertificateItem";
import { GetServerSideProps } from "next/types";
import { useContractRead } from "wagmi";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";
import prisma from "@/lib/db";
import { SCCertificate } from "@/types/custom";
import ClientOnly from "@/components/ClientOnly";
import { useQuery } from "react-query";
import { Certificate } from "@prisma/client";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

interface Props {
  slug: string;
  walletAddress: String;
  isEditable: boolean;
}

const fetchOrgCertificates = async (slug: string) => {
  const response = await axios.get(`/api/org/certificate?slug=${slug}`);
  return response.data;
};

const Certificates = (props: Props) => {
  const { data: contractData }: { data?: SCCertificate[] } = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "getOrgAllCertificates",
    args: [props.walletAddress],
    watch: true
  });

  const { data: dbData } = useQuery<Certificate[]>("orgAllCertificate", () => fetchOrgCertificates(props.slug));

  return (
    <div className="max-container mt-10">
      <div className="flex flex-row justify-between items-center">
        <h2 className="font-semibold text-xl">All Certificates</h2>
        {props.isEditable && <AddCertificateDialog />}
      </div>
      <ClientOnly>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {contractData && dbData ? (
            contractData.map((cert) => (
              <CertificateItem
                key={parseInt(cert.certIndex)}
                certData={cert}
                isEditable={props.isEditable}
                transactionHash={
                  dbData.find((dbCert) => dbCert.orgCertId === parseInt(cert.certIndex))?.transactionHash as string
                }
              />
            ))
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
export default Certificates;
