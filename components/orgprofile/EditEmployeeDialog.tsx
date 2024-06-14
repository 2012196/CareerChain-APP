import { SCEmployee } from "@/types/custom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import EditEmployeeForm from "./EditEmployeeForm";
import { Button } from "../ui/button";

interface Props {
  SCempData: SCEmployee;
}

const EditEmployeeDialog = (props: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-8 text-xs mt-3">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <EditEmployeeForm
            empIndex={Number(props.SCempData.empIndex)}
            startDate={Number(props.SCempData.startedAt) * 1000}
            endDate={Number(props.SCempData.endedAt) * 1000}
            promotions={props.SCempData.promotions}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;
