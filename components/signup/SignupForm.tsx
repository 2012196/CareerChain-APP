import { useState } from "react"
import PersonalRegisterForm from "./PersonalRegisterForm"
import SignUpCard from "./SignUpCard"
import OrganizationRegisterForm from "./OrganizationRegisterForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ClientOnly from "../ClientOnly"
import CustomConnectWallet from "../CustomConnectWallet"

const SignupForm = () => {
  const [isSuccess, setIsSuccess] = useState(false)

  return isSuccess ? (
    <SignUpCard />
  ) : (
    <Tabs defaultValue="personal" className="w-80">
      <TabsList className="w-full">
        <TabsTrigger value="personal" className="w-1/2">
          Personal
        </TabsTrigger>
        <TabsTrigger value="org" className="w-1/2">
          Organization
        </TabsTrigger>
      </TabsList>
      <div className="mt-4">
        <ClientOnly>
          <CustomConnectWallet />
        </ClientOnly>
      </div>
      <div className="mt-6">
        <TabsContent value="personal">
          <ClientOnly>
            <PersonalRegisterForm setIsSuccess={setIsSuccess} />{" "}
          </ClientOnly>
        </TabsContent>
        <TabsContent value="org">
          <ClientOnly>
            <OrganizationRegisterForm setIsSuccess={setIsSuccess} />
          </ClientOnly>
        </TabsContent>
      </div>
    </Tabs>
  )
}

export default SignupForm
