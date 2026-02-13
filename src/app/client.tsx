"use client";
import Image from "next/image";

import {
  Table,
  TableBody,
  TableCaption,
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
import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Client({
  multiSigData,
  opsData,
  block,
}: {
  multiSigData: MultiSig[];
  opsData: ContractInfo[];
  block: bigint;
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
      const labelA = a.label || "";
      const labelB = b.label || "";

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

  const date = new Date(Number(block));

  const totalOpsUsdValue = opsData.reduce((accumulator, contract) => {
    return accumulator + (contract.usdValue || 0n);
  }, 0n);

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8 sm:px-8 sm:py-12 mx-auto max-w-6xl animate-fade-in">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Page Header */}
      <header className="w-full text-center mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-2">
          ENS Wallets
        </h1>
        <p className="text-muted-foreground text-sm">
          Last updated: {date.toLocaleDateString()} at {date.toLocaleTimeString()}
        </p>
      </header>

      <ContractsTable opsData={opsData} />

      {/* Working Group Multisigs Section */}
      <section className="w-full mt-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              Working Group Multisigs
            </h2>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <Select onValueChange={(value) => setSelectedWg(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Working Group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Groups</SelectItem>
                        <SelectItem value="Public Goods">Public Goods</SelectItem>
                        <SelectItem value="Ecosystem">Ecosystem</SelectItem>
                        <SelectItem value="Metagov">Metagov</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableHead>
                  <TableHead>Signers</TableHead>
                  <TableHead className="text-right">ETH</TableHead>
                  <TableHead className="text-right">USDC</TableHead>
                  <TableHead className="text-right">ENS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((multisig, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium min-w-52">
                      <div className="text-foreground font-semibold">
                        {multisig.label}
                      </div>
                      <WalletAddress address={multisig.address} />
                      <div className="text-muted-foreground text-sm mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground border border-border">
                          {multisig.threshold ?? 0} of {multisig.signers.length} signers
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="min-w-56 max-w-96">
                      <div className="flex flex-col gap-1">
                        {multisig.signers.map((signer, signerIndex) => (
                          <DisplaySigner
                            key={signerIndex}
                            address={signer as Address}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-foreground">
                      {formatCurrency(multisig.ethBalance as bigint, 18, 1)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-foreground">
                      {formatCurrency(multisig.usdcBalance as bigint, 6, 0, true)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-foreground">
                      {formatCurrency(multisig.ensBalance as bigint, 18, 0, true)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-muted/30">
                  <TableCell className="text-muted-foreground flex items-center gap-2">
                    <Checkbox
                      onCheckedChange={handleCheckboxChange}
                      checked={showZeroBalance}
                    />
                    <span className="text-sm font-normal">Show zero balance</span>
                  </TableCell>
                  <TableCell className="text-right text-foreground">Total</TableCell>
                  <TableCell className="text-right font-mono text-foreground">
                    {formatCurrency(totalEth, 18, 1)} ETH
                  </TableCell>
                  <TableCell className="text-right font-mono text-foreground">
                    {formatCurrency(totalUsdc, 6, 0, true)} USDC
                  </TableCell>
                  <TableCell className="text-right font-mono text-foreground">
                    {formatCurrency(totalEns, 18, 0, true)} ENS
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Mobile Table */}
          <div className="sm:hidden">
            <div className="px-4 py-3 border-b border-border">
              <Select onValueChange={(value) => setSelectedWg(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Working Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="Public Goods">Public Goods</SelectItem>
                  <SelectItem value="Ecosystem">Ecosystem</SelectItem>
                  <SelectItem value="Metagov">Metagov</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Signers</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((multisig, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium max-w-24 p-2">
                      <div className="text-sm text-foreground font-semibold">
                        {multisig.label}
                      </div>
                      <WalletAddress address={multisig.address} />
                      <div className="text-xs text-muted-foreground mt-1">
                        {multisig.threshold ?? 0} of {multisig.signers.length} signers
                      </div>
                    </TableCell>

                    <TableCell className="max-w-32 p-2">
                      <div className="flex flex-col gap-0.5">
                        {multisig.signers.map((signer, signerIndex) => (
                          <DisplaySigner
                            key={signerIndex}
                            address={signer as Address}
                            mobile={true}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right p-2">
                      <div className="flex flex-col font-mono text-sm text-foreground">
                        <span>
                          {formatCurrency(multisig.ethBalance as bigint, 18, 1)} ETH
                        </span>
                        <span>
                          {formatCurrency(multisig.usdcBalance as bigint, 6, 0, true)} USDC
                        </span>
                        <span>
                          {formatCurrency(multisig.ensBalance as bigint, 18, 0, true)} ENS
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/30">
                  <TableCell className="text-muted-foreground flex items-center gap-2 p-2">
                    <Checkbox
                      onCheckedChange={handleCheckboxChange}
                      checked={showZeroBalance}
                    />
                    <span className="text-xs">Zero bal</span>
                  </TableCell>
                  <TableCell className="text-right text-foreground font-bold p-2">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold p-2 text-foreground">
                    <div className="flex flex-col text-sm">
                      <span>{formatCurrency(totalEth, 18, 1)} ETH</span>
                      <span>{formatCurrency(totalUsdc, 6, 0, true)} USDC</span>
                      <span>{formatCurrency(totalEns, 18, 0, true)} ENS</span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 pt-6 border-t border-border text-center w-full">
        <p className="text-muted-foreground text-sm">
          Created by{" "}
          <Link href="https://etherscan.io/address/slobo.eth" className="text-primary hover:underline transition-colors">
            slobo.eth
          </Link>
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          For governance insights, visit{" "}
          <Link href="https://votingpower.xyz" className="text-primary hover:underline transition-colors">
            votingpower.xyz
          </Link>
        </p>
      </footer>
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const displayAddress =
    address.substring(0, 6) + "..." + address.substring(address.length - 4);

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (address) {
        setLoading(true);
        try {
          const response = await fetch(
            `https://ens-api.slobo.xyz/address/${address}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.avatar?.lg) {
              setAvatarUrl(data.avatar.lg);
            }
          }
        } catch (error) {
          console.error("Error fetching avatar URL:", error);
        }
        setLoading(false);
      }
    };

    fetchAvatarUrl();
  }, [address]);

  return (
    <span className="py-0.5">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex items-center gap-2">
            {!mobile && (
              <Avatar className="w-8 h-8">
                <AvatarImage
                  className="cursor-pointer"
                  src={avatarUrl || ""}
                />
                <AvatarFallback />
              </Avatar>
            )}
            <span className="text-sm text-foreground hover:text-primary transition-colors">
              {ensName || displayAddress}
            </span>
          </TooltipTrigger>
          <TooltipContent copyText={address}>
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
        <TooltipTrigger
          onClick={() =>
            openEtherScan({
              address: address,
            })
          }
          className="flex flex-col gap-0.5 text-left"
        >
          <span className="text-sm text-foreground truncate hover:text-primary transition-colors">
            {ensName
              ? ensName.length > 15
                ? ensName.substring(0, 15) + "..."
                : ensName
              : ""}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {displayAddress}
          </span>
        </TooltipTrigger>
        <TooltipContent
          copyText={address}
          onClick={() =>
            openEtherScan({
              address: address,
            })
          }
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
  short: boolean = false
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
  return num.toString();
}

function ContractsTable({ opsData }: { opsData: ContractInfo[] }) {
  const totalUsdValue = opsData.reduce((accumulator, contract) => {
    return accumulator + (contract.usdValue || 0n);
  }, 0n);

  return (
    <section className="w-full animate-slide-up">
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
            DAO Operational Contracts
          </h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {opsData.map((contract, index) => {
                const alertLevel = getUsdcAlertLevel(contract);
                return (
                  <TableRow
                    key={index}
                    className={
                      alertLevel === "danger"
                        ? "bg-[hsl(var(--row-danger))]"
                        : alertLevel === "warning"
                          ? "bg-[hsl(var(--row-warning))]"
                          : ""
                    }
                  >
                    <TableCell className="font-medium sm:min-w-52">
                      <div className={`font-semibold ${alertLevel === "danger" ? "text-[hsl(var(--row-danger-foreground))]" : alertLevel === "warning" ? "text-[hsl(var(--row-warning-foreground))]" : "text-foreground"}`}>
                        {contract.label || "N/A"}
                      </div>
                      <WalletAddress address={contract.address} />
                    </TableCell>

                    <TableCell className={`sm:min-w-56 max-w-96 ${alertLevel ? "text-[hsl(var(--row-" + alertLevel + "-foreground))]" : "text-muted-foreground"}`}>
                      {contract.description}
                    </TableCell>

                    <TableCell className="text-right font-mono text-foreground">
                      <div className="flex flex-col">
                        <span>
                          {formatCurrency(contract.ethBalance || 0n, 18, 1)} ETH
                        </span>
                        <span>
                          {formatCurrency(contract.ensBalance || 0n, 18, 1, true)} ENS
                        </span>
                        <span className={`inline-flex items-center justify-end gap-1.5 ${alertLevel ? "font-bold text-[hsl(var(--row-" + alertLevel + "-foreground))]" : ""}`}>
                          {formatCurrency(contract.usdcBalance || 0n, 6, 0, true)} USDC
                          {alertLevel && <UsdcAlertIndicator level={alertLevel} />}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="font-bold bg-muted/30">
                <TableCell colSpan={2} className="text-right text-foreground">
                  Total USD Value
                </TableCell>
                <TableCell className="text-right text-foreground font-mono">
                  ${formatCurrency(totalUsdValue, 18, 1, true)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

function UsdcAlertIndicator({ level }: { level: "warning" | "danger" }) {
  const message =
    level === "danger"
      ? "DAO operational funds critically low — less than 30 days of runway at current spend"
      : "DAO operational funds declining — runway may be limited if not replenished";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold leading-none cursor-default ${
              level === "danger"
                ? "bg-[hsl(var(--row-danger-foreground))] text-[hsl(var(--row-danger))]"
                : "bg-[hsl(var(--row-warning-foreground))] text-[hsl(var(--row-warning))]"
            }`}
          >
            !
          </span>
        </TooltipTrigger>
        <TooltipContent>{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const ENS_WALLET_ADDRESS = "0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7";
const USDC_1M = 1_000_000_000_000n; // 1M USDC (6 decimals)
const USDC_500K = 500_000_000_000n; // 500K USDC (6 decimals)

function getUsdcAlertLevel(contract: ContractInfo): "warning" | "danger" | null {
  if (contract.address.toLowerCase() !== ENS_WALLET_ADDRESS.toLowerCase()) return null;
  const usdc = contract.usdcBalance || 0n;
  if (usdc < USDC_500K) return "danger";
  if (usdc < USDC_1M) return "warning";
  return null;
}

const isZero = (amount: bigint, tokenDecimals: number): boolean => {
  if (amount === undefined) {
    return true;
  } else {
    const amountNumber = parseFloat(formatUnits(amount, tokenDecimals));
    return amountNumber <= 0.01;
  }
};

async function openEtherScan({ address }: { address: Address }) {
  await navigator.clipboard.writeText(address);
  const url = `https://etherscan.io/address/${address}`;
  window.open(url, "_blank");
}
