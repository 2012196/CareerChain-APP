import { getServerSession } from "next-auth";
import { GetServerSideProps } from "next/types";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllowedAccountTypes, AuthPersonalAccount } from "@/types/custom";
import Showcase from "@/components/personalprofile/Showcase";
import prisma from "@/lib/db";
import ClientOnly from "@/components/ClientOnly";
import ProfileHeader from "@/components/personalprofile/ProfileHeader";
import PointsHistory from "@/components/personalprofile/PointsHistory";
import EmployementHistory from "@/components/personalprofile/EmployementHistory";

interface Props {
  user: AuthPersonalAccount & { isSelf: boolean; slug: string };
}

export async function getPersonalUserBySlug(slug: string): Promise<AuthPersonalAccount | null> {
  const user = await prisma.account.findFirst({
    where: {
      slug: slug,
    },
    include: {
      PersonalAccount: true,
    },
  });

  if (!user || !user.PersonalAccount) return null;

  return {
    name: user?.PersonalAccount?.name,
    job_title: user?.PersonalAccount?.job_title,
    country: user?.country,
    city: user?.city,
    account_type: user?.account_type as AllowedAccountTypes,
    wallet_address: user?.walletAddress,
    profileImage: user?.profileImage,
    aboutMe: user?.PersonalAccount?.aboutMe,
  };
}

const Personal = ({ user }: Props) => {
  return (
    <div className="max-container mt-10">
      <ClientOnly>
        <ProfileHeader user={user} isEditable={user.isSelf} />
      </ClientOnly>
      <Tabs defaultValue="showcase" className="mt-4">
        <TabsList className="w-full">
          <TabsTrigger value="showcase" className="w-full">
            Showcase
          </TabsTrigger>
          <TabsTrigger value="emp_history" className="w-full">
            Employment History
          </TabsTrigger>
          <TabsTrigger value="points" className="w-full">
            Points
          </TabsTrigger>
        </TabsList>
        <TabsContent value="showcase">
          <ClientOnly>
            <Showcase user={user} />
          </ClientOnly>
        </TabsContent>
        <TabsContent value="emp_history">
          <EmployementHistory user={user} />
        </TabsContent>
        <TabsContent value="points">
          <ClientOnly>
            <PointsHistory user={user} />
          </ClientOnly>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query, req, res }) => {
  const { slug } = query;

  const session = await getServerSession(req, res, authOptions);

  const user = await getPersonalUserBySlug(slug as string);

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: "/404",
      },
      props: {},
    };
  }

  return {
    props: {
      user: {
        ...user,
        isSelf: session?.user.walletAddress === user.wallet_address,
        slug: slug,
      },
    },
  };
};

export default Personal;
