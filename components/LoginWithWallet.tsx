import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { SiweMessage } from "siwe";
import { useAccount, useNetwork, useSignMessage } from "wagmi";
import { signIn } from "next-auth/react";
import { Wallet } from "lucide-react";
import { useToast } from "./ui/use-toast";
import router from "next/router";

const LoginWithWallet = () => {
  const { signMessageAsync } = useSignMessage();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { toast } = useToast();
  const { error: errorParam } = router.query;

  useEffect(() => {
    if (errorParam) {
      toast({
        variant: "destructive",
        title: "Not Registered",
        description: "Wallet is not registered, please signup",
      });
    }
  }, [toast, errorParam]);

  const handleLogin = async () => {
    if (!isConnected) {
      toast({
        variant: "default",
        title: "Wallet not connected",
        description: "Please connect the wallet to login",
      });
      return;
    }

    const message = new SiweMessage({
      domain: window.location.host,
      address: address,
      statement: "Sign in with Wallet",
      uri: window.location.origin,
      version: "1",
      chainId: chain?.id,
    });

    try {
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      await signIn("wallet-login", {
        message: JSON.stringify(message),
        redirect: true,
        signature,
        callbackUrl: "/",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Cancelled",
        description: "Login cancelled",
      });
    }
  };

  return (
    <Button onClick={() => handleLogin()} className="w-full">
      <Wallet className="mr-2" />
      Login with wallet
    </Button>
  );
};

export default LoginWithWallet;
