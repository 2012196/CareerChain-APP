import { CheckCircle, Globe, MapPin, Pencil } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import axios from "axios";
import { useToast } from "../ui/use-toast";
import { useMutation } from "react-query";
import { useState } from "react";
import Link from "next/link";
import { AuthOrgAccount } from "@/types/custom";
import { useContractRead } from "wagmi";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";
import { useRouter } from "next/router";
import VerifyOrgButton from "@/components/orgprofile/VerifyOrgButton";

interface Props {
  user: AuthOrgAccount;
  isEditable: boolean;
  isVerified: boolean;
}

const OrgHeader = (props: Props) => {
  const router = useRouter();
  const [createObjectURL, setCreateObjectURL] = useState("");
  const { toast } = useToast();
  const { data: contractData }: { data?: any } = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "allOrganization",
    args: [props.user.wallet_address],
  });

  const updateProfilePicture = useMutation((userData: FormData) => {
    return axios.post("/api/common/profileimage", userData);
  });

  const uploadToClient = async (event: any) => {
    if (event.target.files && event.target.files[0]) {
      const img = event.target.files[0];
      setCreateObjectURL(URL.createObjectURL(img));

      const body = new FormData();
      body.append("image", img);
      updateProfilePicture.mutate(body, {
        onSuccess(data, variables, context) {
          if (data.status === 200) {
            toast({
              title: "Profile Updated",
              description: "Your profile picture has been updated",
            });
          }
        },
      });
    }
  };

  return (
    <Card className="p-4">
      <CardContent className="flex">
        <label className="relative" htmlFor="profile-image-input">
          {props.isEditable && (
            <div className="absolute hover:cursor-pointer bg-gray-200 top-0 right-0 p-1 rounded-full">
              <Pencil className="w-4 h-4" />
            </div>
          )}

          <Avatar className="h-44 w-44">
            <AvatarImage
              src={createObjectURL ? createObjectURL : (props.user.profileImage as string)}
              alt="profile-img"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </label>
        {props.isEditable && (
          <input
            id="profile-image-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={uploadToClient}
          />
        )}
        <div className="mt-6 ml-10">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-semibold">{props.user.name}</h3>
            {props.isVerified ? (
              <div className="flex items-center justify-center px-1 text-xs bg-green-50 text-green-600 rounded">
                <CheckCircle width={14} color="green" />
                <p className="ml-2">Verified</p>
              </div>
            ) : (
              props.isEditable && <VerifyOrgButton />
            )}
          </div>
          <p className="mt-2 flex items-center gap-1">
            <Globe className="w-4 text-purple-custom" />
            {props.user.website?.replace("http://", "").replace("https://", "")}
          </p>
          <small className="text-gray-customlight flex items-center gap-1">
            <MapPin className="w-4 " />
            {props.user.city}, {props.user.country}
          </small>

          <div className="mt-4 bg-[#D9D9D9] bg-opacity-40 rounded-md flex items-center">
            <p className="bg-purple-custom text-white p-1 px-2 text-xs rounded-md rounded-bl-none">Wallet</p>
            <p className="text-xs px-1 text-[#71717A]">{props.user.wallet_address}</p>
          </div>
        </div>
        <div className="mt-6 ml-auto mr-10">
          <h2 className="text-4xl font-semibold">
            {contractData && Number(contractData[0])}
            <span className="text-base font-normal text-gray-customlight"> Employees</span>
          </h2>
          <Link href={`/org/${router.query.slug}/employees`} className="text-purple-custom">
            View All
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrgHeader;
