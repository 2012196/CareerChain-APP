import CareerChainArtifact from "@/artifacts/contracts/CareerChain.sol/CareerChain.json"
import ClientOnly from "@/components/ClientOnly"
import {
  AwardedCertColumn,
  columns,
} from "@/components/orgprofile/members-table/Columns"
import { DataTable } from "@/components/orgprofile/members-table/Datatable"
import { SCCertificate } from "@/types/custom"
import { Account, AwardedCertificate, PersonalAccount } from "@prisma/client"
import axios from "axios"
import { GetServerSideProps } from "next/types"
import { useEffect, useState } from "react"
import { useContractRead } from "wagmi"

interface Props {
  dbData: (AwardedCertificate & {
    awardedTo: PersonalAccount & { account: Account }
  })[]
  orgAddress: string
  certId: number
}

const Members = (props: Props) => {
  const { data: contractData }: { data?: SCCertificate } = useContractRead({
    address: process.env.NEXT_PUBLIC_CAREER_SC_SEPOLIA as `0x${string}`,
    abi: CareerChainArtifact.abi,
    functionName: "getOrgCertificate",
    args: [props.orgAddress, props.certId],
  })

  const [data, setData] = useState<AwardedCertColumn[]>()

  useEffect(() => {
    const tableData = props.dbData
      .filter((entry) =>
        contractData?.awardedTo.includes(entry.awardedTo.account.walletAddress)
      )
      .map((dbAwarded, index) => {
        return {
          id: index.toString(),
          awardedToImage: dbAwarded.awardedTo.account.profileImage as string,
          awardedToName: dbAwarded.awardedTo.name,
          walletAddress: dbAwarded.awardedTo.account.walletAddress,
          transactionHash: dbAwarded.transactionHash,
          awardedAt: dbAwarded.createdAt,
        }
      })
    setData(tableData)
  }, [contractData, props.dbData])

  return (
    <ClientOnly>
      <div className="max-container mt-10">
        <h2 className="font-semibold text-xl">Members</h2>
        {data && (
          <div className="py-10">
            <DataTable columns={columns} data={data} />
          </div>
        )}
      </div>
    </ClientOnly>
  )
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const { orgAddress, certId, slug } = query

  if (orgAddress && certId) {
    const response = await axios.get(
      `${process.env.NEXTAUTH_URL}/api/org/awardcertificate?type=org&slug=${slug}&certId=${certId}`
    )

    return {
      props: {
        dbData: response.data.awardedCert,
        orgAddress: orgAddress,
        certId: parseInt(certId as string),
      },
    }
  } else {
    return {
      props: {},
    }
  }
}
export default Members
