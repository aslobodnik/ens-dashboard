import { Address } from "viem";

export type MultiSig = {
  address: Address;
  label: string;
  signers: string[];
  threshold: number;
  balance: number | BigInt;
  usdc: number | BigInt;
  ens: number | BigInt;
};
