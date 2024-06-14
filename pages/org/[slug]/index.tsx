import AboutUs from "@/components/orgprofile/AboutUs";
import ActivityFeed from "@/components/orgprofile/ActivityFeed";
import OrgHeader from "@/components/orgprofile/OrgHeader";
import prisma from "@/lib/db";
import { AllowedAccountTypes, AuthOrgAccount } from "@/types/custom";
import React from "react";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";
import { getServerSession } from "next-auth";
import { GetServerSideProps } from "next/types";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Account, Activity } from "@prisma/client";
import ClientOnly from "@/components/ClientOnly";
import { useContractRead } from "wagmi";

interface Props {
  user: AuthOrgAccount & {
    isSelf: boolean;
    activities: (Activity & { Actor: Account })[];
  };
}

export async function getOrgUserBySlug(slug: string): Promise<AuthOrgAccount | null> {
  const user = await prisma.account.findFirst({
    where: {
      slug: slug,
    },
    include: {
      OrganizationAccount: true,
    },
  });

  if (!user || !user.OrganizationAccount) return null;

  return {
    orgId: user.OrganizationAccount.id,
    name: user.OrganizationAccount.name,
    website: user.OrganizationAccount.website,
    country: user.country,
    city: user.city,
    account_type: user.account_type as AllowedAccountTypes,
    wallet_address: user.walletAddress,
    profileImage: user.profileImage,
    aboutUs: user.OrganizationAccount.aboutUs,
  };
}

const Org = ({ user }: Props) => {
  const orgSCdetails: any = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "allOrganization",
    args: [user.wallet_address],
  });

  return (
    <div className="max-container mt-10">
      {orgSCdetails.data && (
        <ClientOnly>
          <OrgHeader user={user} isEditable={user.isSelf} isVerified={orgSCdetails.data[3]} />
        </ClientOnly>
      )}
      <div className="mt-8">
        <AboutUs aboutUs={user.aboutUs as string} isEditable={user.isSelf} />
      </div>
      <div className="mt-8">
        <ActivityFeed activities={user.activities} />
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query, req, res }) => {
  const { slug } = query;
  const session = await getServerSession(req, res, authOptions);
  const user = await getOrgUserBySlug(slug as string);

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: "/404",
      },
      props: {},
    };
  }

  const activities = await prisma.activity.findMany({
    where: {
      orgId: user.orgId,
    },
    include: {
      Actor: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    props: {
      user: {
        ...user,
        isSelf: session?.user.walletAddress === user.wallet_address,
        activities: JSON.parse(JSON.stringify(activities)),
      },
    },
  };
};

export default Org;
