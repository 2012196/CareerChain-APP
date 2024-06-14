import { useAccount } from "wagmi"
import { Button } from "./ui/button"
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react"
import { Check, Loader2, Wallet } from "lucide-react"

const CustomConnectWallet = () => {
  const { isConnected, isDisconnected } = useAccount()
  const { open: isWeb3ModalOpen } = useWeb3ModalState()
  const { open } = useWeb3Modal()

  return (
    <Button
      className={`w-full truncate px-2 ${isConnected ? "bg-primary hover:bg-primary/90" : ""}`}
      onClick={() => open()}
    >
      <div className="mr-2">
        {isDisconnected && !isWeb3ModalOpen && <Wallet />}
        {isWeb3ModalOpen && <Loader2 className="animate-spin" />}
        {isConnected && !isWeb3ModalOpen && <Check className=" text-white" />}
      </div>
      {isConnected ? "Wallet Connected" : "Connect your wallet"}
    </Button>
  )
}

export default CustomConnectWallet
