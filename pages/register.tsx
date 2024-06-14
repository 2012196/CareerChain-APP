import SignupForm from "@/components/signup/SignupForm"
import SignUpHeroImage from "@/public/images/signup_hero.svg"
import Image from "next/image"
import { getServerSession } from "next-auth"
import { GetServerSideProps } from "next/types"
import { authOptions } from "./api/auth/[...nextauth]"

const Register = () => {
  return (
    <div className="max-container">
      <div className="mt-14 flex justify-between">
        <div className="space-y-10">
          <h1 className="text-4xl font-semibold leading-snug">
            Empower your career with blockchain
            <br />
            Join us today!
          </h1>
          <SignupForm />
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

export default Register
