import { Address } from "viem";

export type CustomAvatarProps = {
  name: string;
  image: string;
  className?: string;
};

export type AvatarStackProps = {
  avatars: CustomAvatarProps[];
};

export type MultiSig = {
  address: Address;
  workingGroup: string;
  signers: string[];
  balance: number;
  usdc: number;
  ens: number;
};
