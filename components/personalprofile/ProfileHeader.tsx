import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, MapPin, Pencil } from "lucide-react";
import { AuthPersonalAccount, SCPersonal } from "@/types/custom";
import { useState } from "react";
import { useMutation } from "react-query";
import axios from "axios";
import { useToast } from "../ui/use-toast";
import { useContractRead } from "wagmi";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";

interface Props {
  user: AuthPersonalAccount;
  isEditable: boolean;
}

const ProfileHeader = ({ user, isEditable }: Props) => {
  const [createObjectURL, setCreateObjectURL] = useState("");
  const { toast } = useToast();

  const { data: SCpersonalData }: { data?: SCPersonal } = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "allPersonal",
    args: [user.wallet_address],
  });

  // SCpersonalData && console.log( SCpersonalData)

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
          {isEditable && (
            <div className="absolute hover:cursor-pointer bg-gray-200 top-0 right-0 p-1 rounded-full">
              <Pencil className="w-4 h-4" />
            </div>
          )}

          <Avatar className="h-44 w-44">
            <AvatarImage src={createObjectURL ? createObjectURL : (user.profileImage as string)} alt="profile-img" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </label>
        {isEditable && (
          <input
            id="profile-image-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={uploadToClient}
          />
        )}
        <div className="mt-6 ml-10">
          <h3 className="text-2xl font-semibold">{user.name}</h3>
          <p className="mt-2 flex items-center gap-1">
            <Briefcase className="w-4 text-purple-custom" />
            {user.job_title}
          </p>
          <small className="text-gray-customlight flex items-center gap-1">
            <MapPin className="w-4 " />
            {user.city}, {user.country}
          </small>

          <div className="mt-4 bg-[#D9D9D9] bg-opacity-40 rounded-md flex items-center">
            <p className="bg-purple-custom text-white p-1 px-2 text-xs rounded-md rounded-bl-none">Wallet</p>
            <p className="text-xs px-1 text-[#71717A]">{user.wallet_address}</p>
          </div>
        </div>
        <div className="mt-6 ml-auto mr-10">
          <h2 className="text-4xl font-semibold">
            {SCpersonalData && Number(SCpersonalData[2])}
            <span className="text-base font-normal text-gray-customlight"> Points</span>
          </h2>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
