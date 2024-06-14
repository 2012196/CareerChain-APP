import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import axios from "axios";
import { Ban, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { FunctionComponent, useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useAccount} from "wagmi";
import { checkSlug } from "@/pages/api/common/checkslug";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Country, City } from "country-state-city";
import { cn } from "@/lib/utils";

const OrganizationRegisterformSchema = z.object({
  walletAddress: z.string().nonempty(),
  type: z.string().default("org"),
  orgName: z.string().nonempty("Organization name cannot be empty"),
  orgWebsite: z
    .string()
    .nonempty()
    .refine(
      (value) => {
        // Regular expression for validating domain names
        const domainNameRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
        return domainNameRegex.test(value);
      },
      {
        message: "Please provide a valid domain name",
      }
    ),
  slug: z.string().nonempty("Profile link cannot be empty").max(10),
  city: z.string().nonempty("City cannot be empty"),
  country: z.string().nonempty("Country cannot be empty"),
});

interface ComponentProps {
  setIsSuccess(isSuccess: boolean): any;
}

const OrganizationRegisterForm: FunctionComponent<ComponentProps> = (props) => {
  const { toast } = useToast();
  const { isConnected: isWalletConnected, address } = useAccount();
  const [slug, setSlug] = useState("");
  const [countryCode, setCountryCode] = useState("");


  const createOrgProfile = useMutation((userData: z.infer<typeof OrganizationRegisterformSchema>) => {
    return axios.post("/api/register/org", userData);
  });

  const checkSlugQuery = useQuery({
    queryKey: ["slug", slug],
    queryFn: () => checkSlug(slug),
    retry: 2,
  });

  const form = useForm<z.infer<typeof OrganizationRegisterformSchema>>({
    resolver: zodResolver(OrganizationRegisterformSchema),
    defaultValues: {
      walletAddress: address,
    },
  });

  async function onSubmit(values: z.infer<typeof OrganizationRegisterformSchema>) {
    try {
      createOrgProfile.mutate(
        { ...values, walletAddress: address as string },
        {
          onError(error) {
            const err = error as AxiosError;
            if (err?.response?.status === 409) {
              toast({
                variant: "destructive",
                title: "Already Exists",
                description: "Wallet is already registered",
              });
            }
          },
        }
      );
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Contract Write Failed",
        description: "Failed to write organization in smart contract, please try again",
      });
    }
  }

  useEffect(() => {
    props.setIsSuccess(createOrgProfile.isSuccess);
  }, [props, createOrgProfile.isSuccess]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 w-80">
        <FormField
          disabled={!isWalletConnected}
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <Input
                    {...field}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      field.onChange(e);
                    }}
                  />
                  <small className="flex items-center gap-2">
                    {checkSlugQuery.isLoading ? (
                      <Loader2 className="animate-spin" width={16} />
                    ) : (
                      <div>
                        {checkSlugQuery.data === 200 ? (
                          <Check width={16} className="text-green-500" />
                        ) : (
                          <Ban width={16} className="text-red-400" />
                        )}
                      </div>
                    )}
                    {window.location.origin}/org/{field.value}
                  </small>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          disabled={!isWalletConnected}
          control={form.control}
          name="orgName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input placeholder="SZABIST" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          disabled={!isWalletConnected}
          control={form.control}
          name="orgWebsite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Website</FormLabel>
              <FormControl>
                <Input placeholder="yourdomain.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Country</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      disabled={!isWalletConnected}
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      {field.value
                        ? Country.getAllCountries().find((country) => country.isoCode === field.value)?.name
                        : "Select country"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 h-[300px]">
                  <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {Country.getAllCountries().map((country) => (
                        <CommandItem
                          value={country.name}
                          key={country.isoCode}
                          onSelect={() => {
                            form.setValue("country", country.isoCode);
                            setCountryCode(() => country.isoCode);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              country.isoCode === field.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {country.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>City</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      disabled={!countryCode || !isWalletConnected}
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      {field.value
                        ? City.getCitiesOfCountry(countryCode)?.find((city) => city.name === field.value)?.name
                        : "Select city"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 h-[300px]">
                  <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      {City.getCitiesOfCountry(countryCode)?.map((city) => (
                        <CommandItem
                          value={city.name}
                          key={city.stateCode}
                          onSelect={() => {
                            form.setValue("city", city.name);
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", city.name === field.value ? "opacity-100" : "opacity-0")}
                          />
                          {city.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className={`w-full ${!isWalletConnected ? "bg-primary hover:bg-primary/90" : ""}`}
          disabled={
            createOrgProfile.isLoading ||
            !isWalletConnected ||
            checkSlugQuery.data !== 200
          }
          type="submit"
        >
          {createOrgProfile.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center mt-2">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground mt-2">Or</span>
          </div>
        </div>
        <p className="text-center text-muted-foreground">
          Already have an account?
          <span className="text-purple-400">
            <Link href="/signin"> Login here</Link>
          </span>
        </p>
      </form>
    </Form>
  );
};

export default OrganizationRegisterForm;
