import { PlusCircle } from "lucide-react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import AddCertificateForm from "./AddCertificateForm"

const AddCertificateDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" width={18} />
          Add new certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>Add New Certificate</DialogTitle>
          <DialogDescription>
            Add a new certificate in the blockchain.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <AddCertificateForm />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddCertificateDialog
