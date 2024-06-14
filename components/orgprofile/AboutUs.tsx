import { useState } from "react"
import { useMutation } from "react-query"
import { useToast } from "../ui/use-toast"
import axios from "axios"
import { Button } from "../ui/button"
import { Pencil } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Textarea } from "../ui/textarea"

interface Props {
  aboutUs: string
  isEditable: boolean
}

const AboutUs = (props: Props) => {
  const [isEditing, setIsEditing] = useState(false)
  const [aboutUsText, setAboutUsText] = useState(props.aboutUs)
  const [textareaText, setTextAreaText] = useState(props.aboutUs)
  const { toast } = useToast()

  const updateAboutUs = useMutation((userData: any) => {
    return axios.post("/api/org/detail", userData)
  })

  const handleSubmit = () => {
    setAboutUsText(textareaText)
    setIsEditing(false)
    const body = {
      aboutUs: textareaText,
    }
    updateAboutUs.mutate(body, {
      onSuccess(data, variables, context) {
        if (data.status === 200) {
          toast({
            title: "Profile Updated",
            description: "Your details have been updated",
          })
        }
      },
    })
  }

  return (
    <div>
      <div className="flex justify-between">
        <h2 className="font-semibold text-xl">About Us</h2>
        {props.isEditable && (
          <Button
            variant={"ghost"}
            className="p-0 w-8 h-8 rounded-full"
            onClick={() => setIsEditing((prev) => !prev)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="mt-4">
        <Card className="p-4">
          <CardContent className="pl-4">
            {isEditing ? (
              <div>
                <Textarea
                  value={textareaText}
                  onChange={(e) => setTextAreaText(e.target.value)}
                />
                <Button className="mt-4" onClick={handleSubmit}>
                  Save
                </Button>
              </div>
            ) : (
              <p>{aboutUsText}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AboutUs
