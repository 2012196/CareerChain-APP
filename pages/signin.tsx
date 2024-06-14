import Image from "next/image"
import SignUpHeroImage from "@/public/images/signup_hero.svg"
import LoginWithWallet from "@/components/LoginWithWallet"
import ClientOnly from "@/components/ClientOnly"
import { getServerSession } from "next-auth"
import { GetServerSideProps } from "next/types"
import { authOptions } from "./api/auth/[...nextauth]"

const Signin = () => {
  return (
    <div className="max-container">
      <div className="mt-14 flex justify-between">
        <div className="space-y-10 my-auto">
          <h1 className="text-4xl font-semibold leading-snug">
            Continue to the application
          </h1>
          <ClientOnly>
            <LoginWithWallet />
          </ClientOnly>
        </div>
        <Image
          alt="signup-hero"
          src={SignUpHeroImage}
          priority={true}
          className="object-contain h-full my-auto"
        />
      </div>
    </div>
  )
}
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions)

  if (session) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    }
  }

  return {
    props: {},
  }
}
export default Signin
