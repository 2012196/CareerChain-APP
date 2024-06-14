import { Card } from "./ui/card";

interface Props {
  text: string;
}

const EmptyCard = (props: Props) => {
  return <Card className="flex justify-center items-center h-44 text-gray-customlight bg-slate-100">{props.text}</Card>;
};

export default EmptyCard;
