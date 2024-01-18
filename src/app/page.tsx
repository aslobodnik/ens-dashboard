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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type CustomAvatar = {
  name: string;
  image: string;
};

// Define the type for the component's props
type AvatarStackProps = {
  avatars: CustomAvatar[];
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="scroll-m-20 text-4xl mb-10 font-extrabold tracking-tight lg:text-4xl">
        ENS DAO Dashboard
      </h1>
      <div>
        <Table>
          <TableCaption>ENS DAO Wallets</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-center">Address</TableHead>
              <TableHead className="text-center">Working Group </TableHead>
              <TableHead className="text-center">Signers</TableHead>
              <TableHead colSpan={3} className="text-center">
                Current Balance
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <WalletAddress address="0x2686A8919Df194aA7673244549E68D42C1685d03" />
              </TableCell>
              <TableCell>Ecosystem</TableCell>
              <TableCell className="flex gap-2">
                <AvatarStack
                  avatars={[
                    {
                      name: "limes.eth",
                      image:
                        "https://pbs.twimg.com/profile_images/1590768794418515968/nWP__xD1_400x400.png",
                    },
                    {
                      name: "184.eth",
                      image:
                        "https://pbs.twimg.com/profile_images/1593023581146972161/dQ5-qk37_400x400.jpg",
                    },
                    {
                      name: "slobo.eth",
                      image:
                        "https://pbs.twimg.com/profile_images/1520031978376077313/SNxbJVLP_400x400.jpg",
                    },
                  ]}
                />
              </TableCell>
              <TableCell className="text-right">10.0 ETH</TableCell>
              <TableCell className="text-right">250 USDC</TableCell>
              <TableCell className="text-right">250 ENS</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <WalletAddress address="0x2686A8919Df194aA7673244549E68D42C1685d03" />
              </TableCell>
              <TableCell>Public Goods</TableCell>
              <TableCell className="flex gap-2">
                <AvatarStack
                  avatars={[
                    {
                      name: "limes.eth",
                      image:
                        "https://pbs.twimg.com/profile_images/1590768794418515968/nWP__xD1_400x400.png",
                    },
                    {
                      name: "184.eth",
                      image:
                        "https://pbs.twimg.com/profile_images/1593023581146972161/dQ5-qk37_400x400.jpg",
                    },
                    {
                      name: "slobo.eth",
                      image:
                        "https://pbs.twimg.com/profile_images/1520031978376077313/SNxbJVLP_400x400.jpg",
                    },
                  ]}
                />
              </TableCell>
              <TableCell className="text-right">10.0 ETH</TableCell>
              <TableCell className="text-right">250 USDC</TableCell>
              <TableCell className="text-right">250 ENS</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <WalletAddress address="0x2686A8919Df194aA7673244549E68D42C1685d03" />
              </TableCell>
              <TableCell>Ecosystem</TableCell>
              <TableCell className="flex gap-2 relative">
                <AvatarStack
                  avatars={[
                    {
                      name: "coltron.eth",
                      image:
                        "https://pbs.twimg.com/profile_images/1636430861993385986/hCnL6SBv_400x400.jpg",
                    },
                    {
                      name: "simona.eth",
                      image:
                        "https://pbs.twimg.com/profile_images/1494871363034750980/WbDNU90b_400x400.jpg",
                    },
                    {
                      name: "slobo.eth",
                      image:
                        "https://pbs.twimg.com/profile_images/1520031978376077313/SNxbJVLP_400x400.jpg",
                    },
                  ]}
                />
              </TableCell>

              <TableCell className="text-right">10.0 ETH</TableCell>
              <TableCell className="text-right">250 USDC</TableCell>
              <TableCell className="text-right">250 ENS</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Select>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Working Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="eco">Ecosystem</SelectItem>
            <SelectItem value="pg">Public Goods</SelectItem>
            <SelectItem value="meta">Metagov</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </main>
  );
}

function CustomAvatar({
  name,
  image,
  className,
}: {
  name: string;
  image: string;
  className?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Avatar className={className}>
            <AvatarImage className="cursor-pointer" src={image} />
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function WalletAddress({ address }: { address: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex flex-col items-center">
          <span className="">0x2686...85d03</span>
          <span className="text-xs text-gray-500">eco.ens.eth</span>
        </TooltipTrigger>

        <TooltipContent className="">
          <p> 0x2686A8919Df194aA7673244549E68D42C1685d03</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AvatarStack({ avatars }: AvatarStackProps) {
  if (!avatars || avatars.length < 2 || avatars.length > 5) {
    console.error("AvatarStack requires between 2 and 5 avatars.");
    return null;
  }

  return (
    <div className="flex relative">
      {avatars.map((avatar, index) => (
        <CustomAvatar
          key={avatar.name}
          className={`z-${(index + 1) * 10} -ml-${
            index > 0 ? 4 : 0
          } drop-shadow-lg`}
          name={avatar.name}
          image={avatar.image}
        />
      ))}
    </div>
  );
}
