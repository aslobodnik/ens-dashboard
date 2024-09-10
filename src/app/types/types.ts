import { Address } from "viem";

export type ContractInfo = {
  address: Address;
  description?: string;
  label?: string;
  ethBalance?: bigint;
  usdcBalance?: bigint;
  ensBalance?: bigint;
  multisig?: boolean;
  usdValue?: bigint;
};

export type MultiSig = ContractInfo & {
  signers: string[];
  threshold: number;
  multisig: boolean;
};

export type TokenDetails = {
  balance: bigint;
  name: string;
  symbol: string;
  decimals: number;
  usdValue?: bigint;
  address?: Address;
};
