import { IpMetadata } from '@story-protocol/core-sdk'
import { SPGNFTContractAddress, client } from './utils/utils'
import { uploadJSONToIPFS } from './utils/uploadToIpfs'
import { createHash } from 'crypto'
import { OpenAI } from "openai";
import dotenv from 'dotenv';

dotenv.config();

// BEFORE YOU RUN THIS FUNCTION: Make sure to read the README
// which contains instructions for running this "Simple Mint and Register SPG" example.

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const mintAndRegisterIp = async (title: string, description: string): Promise<string> => {
    // 1. Set up your IP Metadata
    //
    // Docs: https://docs.story.foundation/docs/ipa-metadata-standard
    const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
        title,
        description,
        attributes: [
            {
                key: 'Rarity',
                value: 'Legendary',
            },
        ],
    })

    const imageResponse = await openai.images.generate({
        model: "dall-e-2",
        prompt: description,
        n: 1,
        size: "1024x1024",
    });

    const image_url = imageResponse.data[0].url;
    if (!image_url) throw new Error("Failed to generate image");
      

    // 2. Set up your NFT Metadata
    //
    // Docs: https://eips.ethereum.org/EIPS/eip-721
    const nftMetadata = {
        name: title,
        description,
        image: image_url,
    }

    // 3. Upload your IP and NFT Metadata to IPFS
    const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
    const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')
    const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
    const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex')

    // 4. Register the NFT as an IP Asset
    //
    // Docs: https://docs.story.foundation/docs/attach-terms-to-an-ip-asset#mint-nft-register-as-ip-asset-and-attach-terms
    const mintResponse = await client.ipAsset.mintAndRegisterIp({
        spgNftContract: SPGNFTContractAddress,
        allowDuplicates: true,
        ipMetadata: {
            ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
            ipMetadataHash: `0x${ipHash}`,
            nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
            nftMetadataHash: `0x${nftHash}`,
        },
        txOptions: { waitForTransaction: true },
    })
    
    return `https://explorer.story.foundation/ipa/${mintResponse.ipId}`;
}