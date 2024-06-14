import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import { SiweMessage } from "siwe";
import { redirect } from "next/navigation";
import { createPublicClient, http } from "viem";
import { sepolia } from "wagmi";
import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
    error: "/500",
  },
  providers: [
    CredentialsProvider({
      id: "wallet-login",
      name: "Wallet Login",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials, req) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"));
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);

          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
          });

          if (result.success) {
            const data = await publicClient.readContract({
              address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
              abi: CareerChainArtifact.abi,
              functionName: "owner",
            });

            if (data === siwe.address) {
              return {
                id: siwe.address,
                account_id: -1,
                account_type: "admin",
                slug: "admin",
              };
            }

            const existingUser = await prisma.account.findUnique({
              where: { walletAddress: siwe.address },
            });

            if (!existingUser) {
              return null;
            }

            return {
              id: siwe.address,
              account_id: existingUser.id,
              account_type: existingUser.account_type,
              slug: existingUser.slug,
            };
          }

          return null;
        } catch (err) {
          return redirect("/500");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // console.log(token);
      if (user) {
        return {
          ...token,
          account_id: user.account_id,
          account_type: user.account_type,
          slug: user.slug,
        };
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // console.log(session)
      return {
        ...session,
        user: {
          walletAddress: token.sub,
          account_id: token.account_id,
          account_type: token.account_type,
          slug: token.slug,
        },
      };
    },
  },
};
export default NextAuth(authOptions);
