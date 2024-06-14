import Link from "next/link";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Logo from "@/public/images/logo.png";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import ClientOnly from "./ClientOnly";
import { useRouter } from "next/router";
import AwardPointsDialog from "./orgprofile/AwardPointsDialog";
import NewSearchBar from "./NewSearchBar";

const Navbar = () => {
  const { status, data } = useSession();
  const router = useRouter();
  const { isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const pathname = usePathname();

  return (
    <div className="shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]">
      <div className="max-container py-5 flex justify-between items-center ">
        <Link href="/">
          <Image alt="logo" src={Logo} width={200} />
        </Link>
        <div className="w-96">
          <NewSearchBar
            className="shadow-sm"
            handleSelection={(user) => router.push(`/${user.account_type}/${user.slug}`)}
            placeholder="Type username to search profiles"
          />
        </div>
        {status === "authenticated" ? (
          <div className="flex gap-4 items-center">
            {data.user.account_type === "org" && (
              <div className="flex gap-4 items-center">
                <Link
                  className="inline-block border-b-2 border-transparent hover:border-purple-custom transition duration-300"
                  href={`/org/${data.user.slug}/certificates`}
                >
                  Certificates
                </Link>
                <Link
                  className="inline-block border-b-2 border-transparent hover:border-purple-custom transition duration-300"
                  href={`/org/${data.user.slug}/employees`}
                >
                  Employees
                </Link>
                <AwardPointsDialog />
              </div>
            )}
            <Link
              className="inline-block border-b-2 border-transparent hover:border-purple-custom transition duration-300"
              href={`/live`}
            >
              Contract Events
            </Link>
            <ClientOnly>
              {isConnected ? (
                <w3m-account-button balance="hide" />
              ) : (
                <Button onClick={() => open()}>Connect Wallet</Button>
              )}
            </ClientOnly>
            <Button
              onClick={() =>
                signOut({
                  callbackUrl: `${window.location.origin}`,
                })
              }
            >
              Log out
            </Button>
          </div>
        ) : (
          <div className="flex gap-4">
            {pathname !== "/register" && status !== "loading" && (
              <Link href="/register">
                <Button>Join Now</Button>
              </Link>
            )}
            {pathname !== "/signin" && status !== "loading" && (
              <Link href="/signin">
                <Button>Sign In</Button>
              </Link>
            )}
            <ClientOnly>
              {isConnected ? (
                <w3m-account-button balance="hide" />
              ) : (
                <Button onClick={() => open()}>Connect Wallet</Button>
              )}
            </ClientOnly>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
