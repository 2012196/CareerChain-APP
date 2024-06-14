export interface AuthPersonalAccount {
  name: string;
  job_title: string | null;
  country: string | null;
  city: string | null;
  wallet_address: string;
  account_type: AllowedAccountTypes;
  profileImage: string | null;
  aboutMe: string;
}

export interface AuthOrgAccount {
  orgId: number;
  name: string;
  website: string;
  country: string | null;
  city: string | null;
  wallet_address: string;
  account_type: AllowedAccountTypes;
  profileImage: string | null;
  aboutUs: string;
}

export enum AllowedAccountTypes {
  personal = "personal",
  org = "org",
}

export type SCPersonal = [string, number, number, boolean];

export interface SCCertificate {
  certIndex: string;
  createdBy: string;
  name: string;
  description: string;
  imageHash: string;
  awardedTo: string[];
}

export interface SCEmployee {
  empIndex: number;
  employer: string;
  employee: string;
  startedAt: BigInt;
  endedAt: BigInt;
  active: boolean;
  promotions: EmployeePromotions[]
}

export interface EmployeePromotions {
  endedAt: BigInt;
  jobTitle: string;
  position: string;
  startedAt: BigInt;
}

export type FetchEmployeesResponse = {
  transactionHash: string;
  orgAddress: string;
  personalAddress: string;
  profileName: string;
  profileImage: string | null;
  orgProfileImage: string | null;
  empIndex: number;
};

export type FetchEmployeementResponse = {
  employementIndex: number;
  transactionHash: string;
  orgAddress: string;
  orgName: string;
  orgProfileImage: string | null;
};

export type FoundEvents = {
  value: string;
  label: string;
};
