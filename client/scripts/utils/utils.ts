import {
  LicenseTerms,
  StoryClient,
  StoryConfig,
  WIP_TOKEN_ADDRESS,
} from "@story-protocol/core-sdk";
import { http, zeroAddress, zeroHash } from "viem";
import { privateKeyToAccount, Address, Account } from "viem/accounts";
import dotenv from "dotenv";
dotenv.config();

// todo: this should be imported from @story-protocol/core-sdk/declarations/src/types/common
interface LicensingConfig {
  isSet: boolean;
  mintingFee: bigint;
  licensingHook: Address;
  hookData: `0x${string}`;
  commercialRevShare: number;
  disabled: boolean;
  expectMinimumGroupRewardShare: number;
  expectGroupRewardPool: Address;
}

// Add your rpc provider url to your .env file
// You can select from one of these: https://docs.story.foundation/docs/story-network#-rpcs
export const RPCProviderUrl =
  process.env.NEXT_PUBLIC_RPC_PROVIDER_URL || "https://aeneid.storyrpc.io";

// Add your private key to your .env file.
const privateKey = process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY;
if (!privateKey)
  throw new Error("NEXT_PUBLIC_WALLET_PRIVATE_KEY is required in .env");

// Ensure private key has 0x prefix
const formattedPrivateKey = privateKey.startsWith("0x")
  ? privateKey
  : `0x${privateKey}`;
export const account = privateKeyToAccount(
  formattedPrivateKey as `0x${string}`,
);

const config: StoryConfig = {
  account,
  transport: http(RPCProviderUrl),
  chainId: "aeneid",
};

// Initialize client with error handling
let clientInstance: StoryClient;
try {
  clientInstance = StoryClient.newClient(config);
} catch (error) {
  console.error("Failed to initialize Story client:", error);
  throw error;
}
export const client = clientInstance;

// This is a pre-configured PIL Flavor: https://docs.story.foundation/docs/pil-flavors
export const NonCommercialSocialRemixingTermsId = "1";

// A NFT contract address that will be used to represent your IP Assets
export const NFTContractAddress: Address =
  (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as Address) ||
  "0x937bef10ba6fb941ed84b8d249abc76031429a9a";
export const SPGNFTContractAddress: Address = process.env
  .NEXT_PUBLIC_SPG_NFT_CONTRACT_ADDRESS as Address;

// Docs: https://docs.story.foundation/docs/deployed-smart-contracts
export const RoyaltyPolicyLAP: Address =
  "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E";

export function createCommercialRemixTerms(terms: {
  commercialRevShare: number;
  defaultMintingFee: number;
}): LicenseTerms {
  return {
    transferable: true,
    royaltyPolicy: RoyaltyPolicyLAP,
    defaultMintingFee: BigInt(terms.defaultMintingFee),
    expiration: BigInt(0),
    commercialUse: true,
    commercialAttribution: true,
    commercializerChecker: zeroAddress,
    commercializerCheckerData: zeroAddress,
    commercialRevShare: terms.commercialRevShare,
    commercialRevCeiling: BigInt(0),
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: true,
    derivativeRevCeiling: BigInt(0),
    currency: WIP_TOKEN_ADDRESS,
    uri: "",
  };
}

export const defaultLicensingConfig: LicensingConfig = {
  isSet: false,
  mintingFee: BigInt(0),
  licensingHook: zeroAddress,
  hookData: zeroHash,
  commercialRevShare: 0,
  disabled: false,
  expectMinimumGroupRewardShare: 0,
  expectGroupRewardPool: zeroAddress,
};
