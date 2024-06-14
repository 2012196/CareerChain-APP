import Link from "next/link";
import React from "react";
import { Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";

const PlanBanner = () => {
  const { status, data } = useSession();

  if (status == "loading") {
    return;
  }

  if (data && data.user.account_type === "org") {
    return (
      <div className="w-full py-2 text-center bg-gray-900 text-sm text-white flex justify-center items-center">
        <div className="mr-2" />
        <Sparkles width={18} className="mr-2" /> Unlock exclusive perks by subscribing to our plans.
        <Link href="/pricing" className="ml-2 underline hover:text-[#D8BFD8]">
          View plans
        </Link>
      </div>
    );
  }
};

export default PlanBanner;
