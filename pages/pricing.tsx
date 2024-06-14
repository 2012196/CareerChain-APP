import React from "react";
import PlanCard from "@/components/PlanCard";
import CurrentSubcription from "@/components/orgprofile/CurrentSubcription";
import { useSession } from "next-auth/react";

const Pricing = () => {
  const { data } = useSession();

  return (
    <div className="max-container mt-10">
      {data && <CurrentSubcription />}
      <div className="flex flex-col items-center justify-center py-20 ">
        <div className="max-w-3xl text-center space-y-4">
          <h1 className="font-bold tracking-tighter text-4xl">Our Plans</h1>
          <p className="text-gray-500 text-lg ">
            Choose the plan that fits your needs. Pay with crypto and get exclusive perks
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 w-full max-w-5xl">
          <PlanCard
            planID={1}
            planName="Starter"
            planDescription="Good for small teams"
            planPoints="50"
            planPrice="5.00"
            planDuration="1"
          />
          <PlanCard
            planID={2}
            planName="Pro"
            planDescription="Perfect for medium sized teams"
            planPoints="300"
            planPrice="25.00"
            planDuration="6"
          />
          <PlanCard
            planID={3}
            planName="Enterprise"
            planDescription="Perfect for large corporations"
            planPoints="600"
            planPrice="50.00"
            planDuration="12"
          />
        </div>
      </div>
    </div>
  );
};

export default Pricing;
