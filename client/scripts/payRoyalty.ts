import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk'
import { http } from 'viem';
import { Account, privateKeyToAccount, Address } from 'viem/accounts';
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { zeroAddress } from 'viem';

const privateKey: Address = `0x${process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY}`;
const account: Account = privateKeyToAccount(privateKey);

const config: StoryConfig = {
  account: account, // the account object from above
  transport: http(process.env.NEXT_PUBLIC_RPC_PROVIDER_URL),
  chainId: 'aeneid'
};
export const client = StoryClient.newClient(config);

const payRoyalty = async (receiverIpId: `0x${string}`) => {
  const payRoyalty = await client.royalty.payRoyaltyOnBehalf({
    receiverIpId: receiverIpId,
    // receiverIpId: "0x222D64ffF449579EC1D015E6064DA521468E219f", // child ipId
    payerIpId: zeroAddress,
    token: WIP_TOKEN_ADDRESS,
    amount: 1,
    txOptions: { waitForTransaction: true },
  });

  console.log(`https://aeneid.storyscan.xyz/tx/${payRoyalty.txHash}`)
  window.open(`https://aeneid.storyscan.xyz/tx/${payRoyalty.txHash}`, "_blank");
  return `https://aeneid.storyscan.xyz/tx/${payRoyalty.txHash}`
}

export default payRoyalty;
