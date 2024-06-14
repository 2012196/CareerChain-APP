import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import AwardPointsForm from "./AwardPointsForm";

const AwardPointsDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <p className="cursor-pointer inline-block border-b-2 border-transparent hover:border-purple-custom transition duration-300">
          Award Points
        </p>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>Award Points</DialogTitle>
          <DialogDescription>Award points to users</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
 
            <AwardPointsForm />
    
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AwardPointsDialog;
