import { Address } from "viem";

export type MultiSig = {
  address: Address;
  workingGroup: string;
  signers: string[];
  balance: number | BigInt;
  usdc: number | BigInt;
  ens: number | BigInt;
};
