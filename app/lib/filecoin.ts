import { Synapse } from "@filoz/synapse-sdk";

// Initialize Synapse SDK client
let synapseClient: Synapse | null = null;

export function getSynapseClient(): Synapse {
  if (!synapseClient) {
    synapseClient = new Synapse({
      apiKey: process.env.NEXT_PUBLIC_SYNAPSE_API_KEY || "",
      network: "calibration", // Filecoin Calibration Testnet
    });
  }
  return synapseClient;
}

/**
 * Upload a file to Filecoin Onchain Cloud using Synapse SDK
 * @param file - File to upload
 * @returns IPFS CID and gateway URL
 */
export async function uploadToFilecoin(file: File): Promise<{
  cid: string;
  url: string;
}> {
  try {
    const synapse = getSynapseClient();

    // Upload file to Filecoin
    const result = await synapse.upload(file);

    // Construct IPFS gateway URL
    const gatewayUrl = `https://ipfs.io/ipfs/${result.cid}`;

    return {
      cid: result.cid,
      url: gatewayUrl,
    };
  } catch (error) {
    console.error("Error uploading to Filecoin:", error);
    throw new Error("Failed to upload file to Filecoin");
  }
}

/**
 * Upload JSON metadata to Filecoin
 * @param metadata - JSON object to upload
 * @returns IPFS CID and gateway URL
 */
export async function uploadMetadataToFilecoin(
  metadata: Record<string, unknown>
): Promise<{
  cid: string;
  url: string;
}> {
  try {
    const synapse = getSynapseClient();

    // Convert JSON to Blob
    const blob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: "application/json",
    });
    const file = new File([blob], "metadata.json", {
      type: "application/json",
    });

    // Upload to Filecoin
    const result = await synapse.upload(file);

    // Construct IPFS gateway URL
    const gatewayUrl = `https://ipfs.io/ipfs/${result.cid}`;

    return {
      cid: result.cid,
      url: gatewayUrl,
    };
  } catch (error) {
    console.error("Error uploading metadata to Filecoin:", error);
    throw new Error("Failed to upload metadata to Filecoin");
  }
}

/**
 * Get file from Filecoin using CID
 * @param cid - IPFS CID
 * @returns Gateway URL
 */
export function getFilecoinUrl(cid: string): string {
  return `https://ipfs.io/ipfs/${cid}`;
}

