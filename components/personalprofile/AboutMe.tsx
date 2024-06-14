import { Pencil } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { useState } from "react"
import { Textarea } from "../ui/textarea"
import { useMutation } from "react-query"
import axios from "axios"
import { useToast } from "../ui/use-toast"

interface Props {
  aboutMe: string
  isEditable: boolean
}

const AboutMe = (props: Props) => {
  const [isEditing, setIsEditing] = useState(false)
  const [aboutMeText, setAboutMeText] = useState(props.aboutMe)
  const [textareaText, setTextAreaText] = useState(props.aboutMe)
  const { toast } = useToast()

  const updateAboutMe = useMutation((userData: any) => {
    return axios.post("/api/personal/detail", userData)
  })

  const handleSubmit = () => {
    setAboutMeText(textareaText)
    setIsEditing(false)
    const body = {
      aboutMe: textareaText,
    }
    updateAboutMe.mutate(body, {
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
        <h2 className="font-semibold text-lg">About Me</h2>
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
              <p>{aboutMeText}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AboutMe
