import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const alchemyUrl = process.env.ALCHEMY_URL;
const transport = http(alchemyUrl);

const client = createPublicClient({
  chain: mainnet,
  transport,
});

const abi = [
  {
    inputs: [],
    name: "getOwners",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const data = await client.readContract({
  address: "0xBa0c461b22d918FB1F52fEF556310230d177D1F2",
  abi: abi,
  functionName: "getOwners",
});

function Profile() {}
console.log(data);
export default Profile;
