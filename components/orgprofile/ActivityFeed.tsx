import { Activity, Account } from "@prisma/client";
import ActivityItem from "./ActivityItem";
import EmptyCard from "../EmptyCard";

type Props = {
  activities: (Activity & { Actor: Account })[];
};

const ActivityFeed = (props: Props) => {
  return (
    <div>
      <h2 className="font-semibold text-xl">Activity</h2>
      <div className="mt-4 flex flex-col gap-6">
        {props.activities.length > 0 ? (
          props.activities.map((activity) => {
            return (
              <ActivityItem
                key={activity.id}
                username={activity.Actor.slug}
                transactionHash={activity.transactionHash}
                activityType={activity.type}
                timestamp={new Date(activity.createdAt)}
                amount={activity.amount}
              />
            );
          })
        ) : (
          <EmptyCard text="Nothing to show yet" />
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
