import { Address } from "viem";

//TODO clean up usdc Types
export type MultiSig = {
  address: Address;
  label: string;
  signers?: string[];
  threshold?: number;
  balance?: BigInt;
  usdc?: BigInt;
  ens?: BigInt;
};
