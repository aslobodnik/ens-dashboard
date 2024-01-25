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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Address, formatUnits } from "viem";
import { ContractInfo, MultiSig, TokenDetails } from "./types/types";
import { useState } from "react";

export function Client({
  multiSigData,
  opsData,
  endowmentData,
}: {
  multiSigData: MultiSig[];
  opsData: ContractInfo[];
  endowmentData: TokenDetails[];
}) {
  const [selectedWg, setSelectedWg] = useState<string>("all");
  const [showZeroBalance, setShowZeroBalance] = useState<boolean>(false);

  const handleCheckboxChange = (value: boolean) => {
    setShowZeroBalance(value);
  };

  const filteredData = multiSigData
    .filter((multisig) => {
      return (
        (selectedWg === "all" || multisig.label === selectedWg) &&
        (showZeroBalance ||
          !isZero(multisig.ethBalance || 0n, 18) ||
          !isZero(multisig.usdcBalance || 0n, 6) ||
          !isZero(multisig.ensBalance || 0n, 18))
      );
    })
    .sort((a, b) => {
      // Handle cases where label might be undefined or null
      const labelA = a.label || "";
      const labelB = b.label || "";

      // Compare for alphabetical sorting
      if (labelA < labelB) {
        return -1;
      }
      if (labelA > labelB) {
        return 1;
      }
      return 0;
    });

  const totalEth = filteredData.reduce(
    (acc, curr) => acc + (curr.ethBalance || 0n),
    0n
  );
  const totalUsdc = filteredData.reduce(
    (acc, curr) => acc + (curr.usdcBalance || 0n),
    0n
  );
  const totalEns = filteredData.reduce(
    (acc, curr) => acc + (curr.ensBalance || 0n),
    0n
  );

  return (
    <main className="flex min-h-screen flex-col  items-center sm:p-24 mx-auto">
      <h1 className="sm:text-3xl text-2xl sm:mt-0 my-10 font-extrabold ">
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
                <TableCell className="font-medium text-base  min-w-52">
                  <WalletAddress address={multisig.address} />
                  <div className="text-left pt-2 text-gray-400">
                    Signers: {multisig.threshold.toLocaleString()}/
                    {multisig.signers.length}
                  </div>
                  <div className="text-left pt-2 text-gray-400">
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
                  {formatCurrency(multisig.ethBalance as bigint, 18, 1)}
                </TableCell>
                <TableCell className="text-right text-lg">
                  {formatCurrency(multisig.usdcBalance as bigint, 6, 0, true)}
                </TableCell>
                <TableCell className="text-right text-lg">
                  {formatCurrency(multisig.ensBalance as bigint, 18, 0, true)}
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
                {formatCurrency(totalUsdc, 6, 0, true)} USDC
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(totalEns, 18, 0, true)} ENS
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {/*Mobile Table*/}
        <div>
          <Table className="sm:hidden w-full ">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">
                  <Select onValueChange={(value) => setSelectedWg(value)}>
                    <SelectTrigger className="max-w-36">
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
                <TableHead className="text-center">Signers</TableHead>
                <TableHead className="text-center  ">Balances</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((multisig, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium truncate text-xs max-w-9 p-1">
                    <WalletAddress address={multisig.address} />
                    <div className="text-xs text-left pt-2 text-gray-400">
                      Signers: {multisig.threshold.toLocaleString()}/
                      {multisig.signers.length}
                    </div>
                    <div className="text-xs text-left pt-2 text-gray-400">
                      {multisig.label}
                    </div>
                  </TableCell>

                  <TableCell className="flex flex-col max-w-28">
                    {multisig.signers.map((signer, signerIndex) => (
                      <DisplaySigner
                        key={signerIndex}
                        address={signer as Address}
                        mobile={true}
                      />
                    ))}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex text-right font-mono flex-col">
                      <span>
                        {formatCurrency(multisig.ethBalance as bigint, 18, 1)}{" "}
                        &nbsp;ETH
                      </span>
                      <span>
                        {formatCurrency(
                          multisig.usdcBalance as bigint,
                          6,
                          0,
                          true
                        )}{" "}
                        USDC
                      </span>
                      <span>
                        {formatCurrency(
                          multisig.ensBalance as bigint,
                          18,
                          0,
                          true
                        )}{" "}
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
                    <span>{formatCurrency(totalUsdc, 6, 0, true)} USDC</span>
                    <span>
                      {formatCurrency(totalEns, 18, 0, true)} &nbsp;ENS
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
      <ContractsTable opsData={opsData} />
      <EndowmentTable endowmentData={endowmentData} />
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
            <span className=" text-xs mt-0 pl-0 sm:text-base text-left sm:mt-2 sm:pl-2 ">
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
  const handleAddressClick = async () => {
    // Copy address to clipboard
    await navigator.clipboard.writeText(address);

    // Define the URL to open - replace with the appropriate URL format
    const url = `https://etherscan.io/address/${address}`;
    window.open(url, "_blank");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex flex-col">
          <span className="w-full  text-xs sm:text-base  text-left">
            {displayAddress}
          </span>
          <span className="text-xs sm:text-base truncate text-gray-400 w-full text-left mt-1">
            {ensName
              ? ensName.length > 15
                ? ensName.substring(0, 15) + "..."
                : ensName
              : ""}
          </span>
        </TooltipTrigger>
        <TooltipContent
          copyText={address}
          onClick={handleAddressClick}
          className=""
        >
          {address}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function formatCurrency(
  amount: bigint,
  tokenDecimals: number,
  displayDecimals: number,
  short: boolean = false // Default to false if not provided
): string {
  const formattedNumber = parseFloat(formatUnits(amount, tokenDecimals));

  if (short) {
    return formatShort(formattedNumber);
  } else {
    const formatted = formattedNumber.toFixed(displayDecimals);
    return new Intl.NumberFormat("en-US").format(parseFloat(formatted));
  }
}

function formatShort(num: number): string {
  if (num < 1_000) return num.toFixed(1);
  if (num >= 1_000 && num < 1_000_000) return (num / 1_000).toFixed(1) + "k";
  if (num >= 1_000_000 && num < 1_000_000_000)
    return (num / 1_000_000).toFixed(1) + "m";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  return num.toString(); // Fallback for very large numbers
}

function ContractsTable({ opsData }: { opsData: ContractInfo[] }) {
  return (
    <div className=" w-full max-w-3xl ">
      <h2 className="sm:text-3xl text-2xl mt-10 sm:my-10 font-extrabold text-center">
        DAO Operational Contracts
      </h2>
      <div className="overflow-x-auto mx-4 sm:w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sm:text-lg text-center">Contract</TableHead>
              <TableHead className="text-center sm:text-lg ">
                Description
              </TableHead>
              <TableHead className=" text-right text-lg ">Balance</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {opsData.map((contract, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium sm:min-w-52">
                  <div className="text-xs sm:text-base text-left pt-2">
                    <WalletAddress address={contract.address} />
                  </div>
                  <div className="text-xs sm:text-base text-left pt-1 text-gray-400">
                    {contract.label || "N/A"}
                  </div>
                </TableCell>

                <TableCell className="sm:min-w-56 max-w-96 flex-wrap">
                  {contract.description}
                </TableCell>

                <TableCell className="text-right font-mono ">
                  <div className="flex flex-col">
                    <span>
                      {formatCurrency(contract.ethBalance || 0n, 18, 1)}
                      &nbsp;&nbsp;ETH
                    </span>
                    <span>
                      {formatCurrency(contract.ensBalance || 0n, 18, 1, true)}
                      &nbsp;&nbsp;ENS
                    </span>
                    <span>
                      {formatCurrency(contract.usdcBalance || 0n, 6, 0, true)}
                      &nbsp;USDC
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function EndowmentTable({ endowmentData }: { endowmentData: TokenDetails[] }) {
  const filteredData = endowmentData.filter((multisig) => {
    return !isZero(multisig.balance || 0n, multisig.decimals);
  });

  return (
    <div className=" w-full max-w-3xl ">
      <h2 className="sm:text-3xl text-2xl mt-10 sm:my-10 font-extrabold text-center">
        Endowment Balances
      </h2>
      <div className="overflow-x-auto mx-4 sm:w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sm:text-lg text-center">Token</TableHead>
              <TableHead className="text-center sm:text-lg ">
                Description
              </TableHead>
              <TableHead className=" text-right text-lg ">Balance</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.map((contract, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium sm:min-w-52">
                  {contract.symbol}
                </TableCell>

                <TableCell className="sm:min-w-56 max-w-96 flex-wrap">
                  {contract.name}
                </TableCell>

                <TableCell className="text-right font-mono ">
                  <div className="flex flex-col">
                    <span>
                      {formatCurrency(
                        contract.balance || 0n,
                        contract.decimals,
                        1,
                        true
                      )}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

//is zero checks if the balance is less than 0.01 or undefine, if so it returns true
const isZero = (amount: bigint, tokenDecimals: number): boolean => {
  if (amount === undefined) {
    return true;
  } else {
    const amountNumber = parseFloat(formatUnits(amount, tokenDecimals));

    return amountNumber <= 0.01;
  }
};
