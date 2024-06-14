import { Account, OrganizationAccount, PersonalAccount } from "@prisma/client"
import { Input } from "./ui/input"
import { useState } from "react"
import axios from "axios"
import { useQuery } from "react-query"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export type fetchUserResponse = Account & {
  PersonalAccount: PersonalAccount
  OrganizationAccount: OrganizationAccount
}

type Props = {
  handleSelection: (user: fetchUserResponse) => void
  filter?: (user: fetchUserResponse) => void
  placeholder?: string
  className?: string
  includeOnly?: "all" | "personal" | "org"
}

const fetchUsers = async (
  searchQuery: string,
  includeOnly: "all" | "personal" | "org"
) => {
  if (searchQuery) {
    const response = await axios.get(
      `/api/common/search?query=${searchQuery}&includeOnly=${includeOnly}`
    )
    return response.data
  }
}

const NewSearchBar = (props: Props) => {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const includeOnlyValue = props.includeOnly || "all"
  const fetchUsersQuery = useQuery({
    queryKey: ["query", searchQuery],
    queryFn: () => fetchUsers(searchQuery, includeOnlyValue),
  })

  const filterFunction = props.filter || ((user: fetchUserResponse) => true)

  return (
    <div className="relative">
      <Input
        className={cn("rounded-lg focus-visible:ring-transparent shadow-md", props.className)}
        placeholder={props.placeholder || "Type username of the person"}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="absolute mt-1 w-full p-2 z-50 bg-white rounded-bl rounded-br max-h-48 overflow-y-auto">
        <div className="space-y-2">
          {fetchUsersQuery.isLoading ? (
            <div className="w-full p-2 h-10 bg-slate-50 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-purple-custom" />
            </div>
          ) : (
            fetchUsersQuery.data &&
            fetchUsersQuery.data
              .filter((user: fetchUserResponse) => filterFunction(user))
              .map((user: fetchUserResponse) => (
                <div
                  className="cursor-pointer flex p-2 items-center hover:bg-slate-200 rounded-md text-sm"
                  key={user.id}
                  onClick={() => {
                    props.handleSelection(user)
                    setSearchQuery("")
                  }}
                >
                  <Avatar className="w-8 h-8 mr-4">
                    <AvatarImage src={user.profileImage as string} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="font-semibold">
                    {user.OrganizationAccount
                      ? user.OrganizationAccount.name
                      : user.PersonalAccount.name}
                  </div>
                  <div className="ml-auto">@{user.slug}</div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  )
}

export default NewSearchBar
