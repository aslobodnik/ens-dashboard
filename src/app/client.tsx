"use client";
import Image from "next/image";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Checkbox } from "@/components/ui/checkbox";

import { useEnsName } from "wagmi";

import { mainnet } from "viem/chains";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { createPublicClient, http, Address, formatUnits } from "viem";

import { MultiSig } from "./types/types";
import { useState } from "react";

const alchemyUrl = process.env.ALCHEMY_URL;
const transport = http(alchemyUrl);

const client = createPublicClient({
  chain: mainnet,
  transport,
});

export function Client({ multiSigData }: { multiSigData: MultiSig[] }) {
  const [selectedWg, setSelectedWg] = useState<string>("all");
  const [showZeroBalance, setShowZeroBalance] = useState<boolean>(false);

  const handleCheckboxChange = (value: boolean) => {
    setShowZeroBalance(value);
  };

  const isZero = (amount: BigInt | number, tokenDecimals: number): boolean => {
    // Ensure amountNumber is always a number
    const amountNumber =
      typeof amount === "bigint"
        ? parseFloat(formatUnits(amount, tokenDecimals))
        : parseFloat(String(amount));
    return amountNumber <= 0.01;
  };

  const filteredData = multiSigData.filter((multisig) => {
    return (
      (selectedWg === "all" || multisig.label === selectedWg) &&
      (showZeroBalance ||
        !isZero(multisig.balance, 18) ||
        !isZero(multisig.usdc, 6) ||
        !isZero(multisig.ens, 18))
    );
  });

  const totalEth = filteredData.reduce(
    (acc, curr) => acc + toBigInt(curr.balance),
    BigInt(0)
  );
  const totalUsdc = filteredData.reduce(
    (acc, curr) => acc + toBigInt(curr.usdc),
    BigInt(0)
  );
  const totalEns = filteredData.reduce(
    (acc, curr) => acc + toBigInt(curr.ens),
    BigInt(0)
  );

  return (
    <main className="flex min-h-screen flex-col  items-center sm:p-24 mx-auto">
      <h1 className="text-3xl sm:mt-0 my-10 font-extrabold ">
        Working Group Multisigs
      </h1>
      <div>
        {/*Desktop Table*/}
        <Table className="hidden sm:block">
          {/* <TableCaption>ENS DAO Wallets</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]  text-lg text-center">
                <Select onValueChange={(value) => setSelectedWg(value)}>
                  <SelectTrigger className="w-[180px] text-lg">
                    <SelectValue placeholder="Working Group" />
                  </SelectTrigger>
                  <SelectContent className="text-lg">
                    <SelectItem value="all">Working Group</SelectItem>
                    <SelectItem value="Public Goods">Public Goods</SelectItem>
                    <SelectItem value="Ecosystem">Ecosystem</SelectItem>
                    <SelectItem value="Metagov">Metagov</SelectItem>
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead className="text-center text-lg">Signers</TableHead>
              <TableHead className="text-right text-lg">ETH</TableHead>
              <TableHead className="text-right text-lg">USDC</TableHead>
              <TableHead className="text-right text-lg">ENS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((multisig, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium  min-w-52">
                  <WalletAddress address={multisig.address} />
                  <div className="text-xs text-left pt-2 text-gray-400">
                    Signers: {multisig.threshold.toLocaleString()}/
                    {multisig.signers.length}
                  </div>
                  <div className="text-xs text-left pt-2 text-gray-400">
                    {multisig.label}
                  </div>
                </TableCell>

                <TableCell className="flex flex-col   min-w-56 max-w-96 flex-wrap">
                  {multisig.signers.map((signer, signerIndex) => (
                    <DisplaySigner
                      key={signerIndex}
                      address={signer as Address}
                    />
                  ))}
                </TableCell>
                <TableCell className="text-right text-lg">
                  {formatCurrency(multisig.balance as bigint, 18, 1)}
                </TableCell>
                <TableCell className="text-right text-lg">
                  {formatCurrency(multisig.usdc as bigint, 6, 0)}
                </TableCell>
                <TableCell className="text-right text-lg">
                  {formatCurrency(multisig.ens as bigint, 18, 0)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="text-lg font-bold">
              <TableCell className="font-normal text-sm text-gray-400 flex gap-1">
                <Checkbox
                  onCheckedChange={handleCheckboxChange}
                  checked={showZeroBalance}
                />
                Show Zero Balance
              </TableCell>
              <TableCell className="text-right">Total</TableCell>
              <TableCell className="text-right">
                {formatCurrency(totalEth, 18, 1)} ETH
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(totalUsdc, 6, 0)} USDC
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(totalEns, 18, 0)} ENS
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {/*Mobile Table*/}
        <div>
          <Table className="sm:hidden w-full ">
            {/* <TableCaption>ENS DAO Wallets</TableCaption> */}
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">
                  <Select onValueChange={(value) => setSelectedWg(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Working Group" />
                    </SelectTrigger>
                    <SelectContent className="text-lg">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Public Goods">Public Goods</SelectItem>
                      <SelectItem value="Ecosystem">Ecosystem</SelectItem>
                      <SelectItem value="Metagov">Metagov</SelectItem>
                    </SelectContent>
                  </Select>
                </TableHead>
                <TableHead className="text-center ">Signers</TableHead>
                <TableHead className="text-center ">Balances</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((multisig, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium ">
                    <WalletAddress address={multisig.address} />
                    <div className="text-xs text-left pt-2 text-gray-400">
                      Signers: {multisig.threshold.toLocaleString()}/
                      {multisig.signers.length}
                    </div>
                    <div className="text-xs text-left pt-2 text-gray-400">
                      {multisig.label}
                    </div>
                  </TableCell>

                  <TableCell className="flex flex-col w-fit text-nowrap flex-wrap">
                    {multisig.signers.map((signer, signerIndex) => (
                      <DisplaySigner
                        key={signerIndex}
                        address={signer as Address}
                        mobile={true}
                      />
                    ))}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex text-right   font-mono flex-col">
                      <span>
                        {formatCurrency(multisig.balance as bigint, 18, 1)}{" "}
                        &nbsp;ETH
                      </span>
                      <span>
                        {formatCurrency(multisig.usdc as bigint, 6, 0)} USDC
                      </span>
                      <span>
                        {formatCurrency(multisig.ens as bigint, 18, 0)}{" "}
                        &nbsp;ENS
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-normal text-sm text-gray-400 flex gap-1">
                  <Checkbox
                    onCheckedChange={handleCheckboxChange}
                    checked={showZeroBalance}
                  />
                  Show Zero Balance
                </TableCell>
                <TableCell className="text-right  text-xl font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right font-mono font-bold">
                  <div className="flex flex-col">
                    <span>{formatCurrency(totalEth, 18, 1)} &nbsp;ETH</span>
                    <span>{formatCurrency(totalUsdc, 6, 0)} USDC</span>
                    <span>{formatCurrency(totalEns, 18, 0)} &nbsp;ENS</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}

function DisplaySigner({
  address,
  mobile = false,
}: {
  address: Address;
  mobile?: boolean;
}) {
  const { data: ensName, isLoading: isLoadingEnsName } = useEnsName({
    address,
  });

  const displayAddress =
    address.substring(0, 6) + "..." + address.substring(address.length - 4);

  return (
    <span className="py-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex text-lg">
            {!mobile && (
              <Avatar className="w-10 h-10 drop-shadow-md">
                <AvatarImage
                  className="cursor-pointer "
                  src={`https://metadata.ens.domains/mainnet/avatar/${ensName}`}
                />
                <AvatarFallback></AvatarFallback>
              </Avatar>
            )}
            <span className="w-full text-xs mt-0 pl-0 sm:text-base text-left sm:mt-2 sm:pl-2 ">
              {ensName || displayAddress}
            </span>
          </TooltipTrigger>
          <TooltipContent copyText={address} className="">
            {address}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  );
}

function WalletAddress({ address }: { address: Address }) {
  const { data: ensName, isLoading } = useEnsName({
    address: address,
  });
  const displayAddress =
    address.substring(0, 6) + "..." + address.substring(address.length - 4);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex flex-col ">
          <span className="w-full text-left">{displayAddress}</span>
          <span className="text-xs  text-gray-400 w-full text-left mt-1">
            {ensName}
          </span>
        </TooltipTrigger>
        <TooltipContent copyText={address} className="">
          {address}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function formatCurrency(
  amount: bigint,
  tokenDecimals: number,
  displayDecimals: number
): string {
  const formatted = parseFloat(formatUnits(amount, tokenDecimals)).toFixed(
    displayDecimals
  );
  return new Intl.NumberFormat("en-US").format(parseFloat(formatted));
}

function toBigInt(value: number | bigint | BigInt | null | undefined): bigint {
  if (value === null || value === undefined) {
    return BigInt(0);
  } else if (typeof value === "number" || typeof value === "bigint") {
    return BigInt(value);
  } else {
    throw new Error("Invalid type for conversion to bigint");
  }
}
