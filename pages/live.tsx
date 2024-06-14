import React, { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";
import LiveEventItem from "@/components/LiveEventItem";
import EmptyCard from "@/components/EmptyCard";
import { format } from "date-fns/format";
import { Input } from "@/components/ui/input";
import LiveEventComboBox from "@/components/LiveEventComboBox";
import { FoundEvents } from "@/types/custom";
import stringify from "safe-stable-stringify";

enum EventType {
  EmployeeAdded = "EmployeeAdded",
  EmployeeEdit = "EmployeeEdit",
  CertificateCreated = "CertificateCreated",
  CertificateAwarded = "CertificateAwarded",
  PointAwarded = "PointAwarded",
  VerifyOrganization = "VerifyOrganization",
  Promoted = "Promoted",
}

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const Live = () => {
  const [events, setEvents] = useState<any>();
  const [searchTerm, setSearchTerm] = useState("");
  const [foundEvents, setFoundEvents] = useState<FoundEvents[]>([]);
  const [curEventFilter, setCurEventFilter] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      const logs = await publicClient.getContractEvents({
        address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
        abi: CareerChainArtifact.abi,
        fromBlock: BigInt(process.env.NEXT_PUBLIC_SC_BLOCK as string),
      });

      setEvents(logs.reverse());
    }

    fetchEvents();
  }, [process.env.NEXT_PUBLIC_SC_BLOCK]);

  useEffect(() => {
    if (events) {
      const uniqueEvents: FoundEvents[] = Array.from(new Set(events.map((e: { eventName: string }) => e.eventName)))
        .map((eventName) => ({ value: String(eventName).toLowerCase() as string, label: eventName as string }))
        .filter((eventName) => eventName.value !== "ownershiptransferred");

      setFoundEvents(uniqueEvents);
    }
  }, [events]);

  return (
    <div className="max-container mt-10">
      <h2 className="font-semibold text-xl">Contract Event Stream</h2>
      <div className="mt-8">
        <div className="flex gap-2">
          <LiveEventComboBox
            foundEventTypes={[{ value: "all", label: "All" }, ...foundEvents]}
            setCurEventFilter={setCurEventFilter}
          />
          <Input
            className="w-full col-span-4 mb-6"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {events && events.length == 0 ? (
          <EmptyCard text="No contract events yet..." />
        ) : (
          events &&
          events.map((event: any) => {
            if (!stringify(event)?.toLowerCase()?.includes(searchTerm.toLowerCase())) {
              return null;
            }

            if (curEventFilter !== event.eventName.toLowerCase() && curEventFilter !== "" && curEventFilter !== "all") {
              return null;
            }

            if (event.eventName === EventType.EmployeeAdded) {
              return (
                <LiveEventItem
                  key={event.transactionHash}
                  transactionHash={event.transactionHash}
                  timestamp={Number(event.args.timestamp)}
                >
                  <div className="bg-gray-100 p-3 w-1/2 rounded-sm border text-sm">
                    <p>
                      <span className="text-gray-500">Event :</span>{" "}
                      <span className="font-semibold text-purple-custom">{event.eventName}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">Employee :</span> {event.args.employee}
                    </p>
                    <p>
                      <span className="text-gray-500">Employer :</span> {event.args.employer}
                    </p>
                    <p>
                      <span className="text-gray-500">Job Title :</span> {event.args.jobTitle}
                    </p>
                    <p>
                      <span className="text-gray-500">Position :</span> {event.args.position}
                    </p>
                    <p>
                      <span className="text-gray-500">Started At :</span> {Number(event.args.startedAt)} (
                      {format(Number(event.args.startedAt) * 1000, "dd MMM yyyy")})
                    </p>
                    <p>
                      <span className="text-gray-500">Ended At :</span> {Number(event.args.endedAt)}
                    </p>
                  </div>
                </LiveEventItem>
              );
            } else if (event.eventName === EventType.EmployeeEdit) {
              return (
                <LiveEventItem
                  key={event.transactionHash}
                  transactionHash={event.transactionHash}
                  timestamp={Number(event.args.timestamp)}
                >
                  <div className="bg-gray-100 p-3 w-1/2 rounded-sm border text-sm">
                    <p>
                      <span className="text-gray-500">Event :</span>{" "}
                      <span className="font-semibold text-purple-custom">{event.eventName}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">Employee :</span> {event.args.employee}
                    </p>
                    <p>
                      <span className="text-gray-500">Employer :</span> {event.args.employer}
                    </p>
                    <p>
                      <span className="text-gray-500">Ended At :</span> {Number(event.args.endedAt)} (
                      {format(Number(event.args.endedAt) * 1000, "dd MMM yyyy")})
                    </p>
                  </div>
                </LiveEventItem>
              );
            } else if (event.eventName === EventType.PointAwarded) {
              return (
                <LiveEventItem
                  key={event.transactionHash}
                  transactionHash={event.transactionHash}
                  timestamp={Number(event.args.timestamp)}
                >
                  <div className="bg-gray-100 p-3 w-1/2 rounded-sm border text-sm">
                    <p>
                      <span className="text-gray-500">Event :</span>{" "}
                      <span className="font-semibold text-purple-custom">{event.eventName}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">Amount :</span> {Number(event.args.amount)}
                    </p>
                    <p>
                      <span className="text-gray-500">Awarded by :</span> {event.args.awardedBy}
                    </p>
                    <p>
                      <span className="text-gray-500">Awarded to :</span> {event.args.awardedTo}
                    </p>
                    <p>
                      <span className="text-gray-500">Reason :</span> {event.args.reason}
                    </p>
                  </div>
                </LiveEventItem>
              );
            } else if (event.eventName === EventType.CertificateCreated) {
              return (
                <LiveEventItem
                  key={event.transactionHash}
                  transactionHash={event.transactionHash}
                  timestamp={Number(event.args.timestamp)}
                >
                  <div className="bg-gray-100 p-3 w-1/2 rounded-sm border text-sm">
                    <p>
                      <span className="text-gray-500">Event :</span>{" "}
                      <span className="font-semibold text-purple-custom">{event.eventName}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">CertIndex :</span> {Number(event.args.certIndex)}
                    </p>
                    <p>
                      <span className="text-gray-500">Name :</span> {event.args.name}
                    </p>
                    <p>
                      <span className="text-gray-500">Creator :</span> {event.args.creator}
                    </p>
                    <p>
                      <span className="text-gray-500">Description :</span> {event.args.description}
                    </p>
                    <p>
                      <span className="text-gray-500">Image Hash :</span> {event.args.imageHash}
                    </p>
                  </div>
                </LiveEventItem>
              );
            } else if (event.eventName === EventType.CertificateAwarded) {
              return (
                <LiveEventItem
                  key={event.transactionHash}
                  transactionHash={event.transactionHash}
                  timestamp={Number(event.args.timestamp)}
                >
                  <div className="bg-gray-100 p-3 w-1/2 rounded-sm border text-sm">
                    <p>
                      <span className="text-gray-500">Event :</span>{" "}
                      <span className="font-semibold text-purple-custom">{event.eventName}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">CertIndex :</span> {Number(event.args.certIndex)}
                    </p>
                    <p>
                      <span className="text-gray-500">Awarded To :</span> {event.args.awardedTo}
                    </p>
                    <p>
                      <span className="text-gray-500">Org :</span> {event.args.org}
                    </p>
                  </div>
                </LiveEventItem>
              );
            } else if (event.eventName === EventType.VerifyOrganization) {
              return (
                <LiveEventItem
                  key={event.transactionHash}
                  transactionHash={event.transactionHash}
                  timestamp={Number(event.args.timestamp)}
                >
                  <div className="bg-gray-100 p-3 w-1/2 rounded-sm border text-sm">
                    <p>
                      <span className="text-gray-500">Event :</span>{" "}
                      <span className="font-semibold text-purple-custom">{event.eventName}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">Organization Address :</span> {event.args.orgAddress}
                    </p>
                    <p>
                      <span className="text-gray-500">Verification Key :</span> {event.args.verificationKey}
                    </p>
                  </div>
                </LiveEventItem>
              );
            } else if (event.eventName === EventType.Promoted) {
              return (
                <LiveEventItem
                  key={event.transactionHash}
                  transactionHash={event.transactionHash}
                  timestamp={Number(event.args.timestamp)}
                >
                  <div className="bg-gray-100 p-3 w-1/2 rounded-sm border text-sm">
                    <p>
                      <span className="text-gray-500">Event :</span>{" "}
                      <span className="font-semibold text-purple-custom">{event.eventName}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">Employee :</span> {event.args.employee}
                    </p>
                    <p>
                      <span className="text-gray-500">Employer :</span> {event.args.employer}
                    </p>
                    <p>
                      <span className="text-gray-500">Job title :</span> {event.args.jobTitle}
                    </p>
                    <p>
                      <span className="text-gray-500">Position :</span> {event.args.position}
                    </p>
                  </div>
                </LiveEventItem>
              );
            }
          })
        )}
      </div>
    </div>
  );
};

export default Live;
