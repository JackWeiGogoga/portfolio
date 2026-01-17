/**
 * NFT Metadata 标准格式 (ERC721)
 */
export interface NftMetadata {
  name: string;
  description: string;
  image: string; // IPFS URI
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  background_color?: string;
  animation_url?: string;
}

/**
 * IPFS 上传配置
 * 使用 Pinata 作为示例，您也可以使用 NFT.Storage 或 Web3.Storage
 */
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

const PINATA_UPLOAD_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

/**
 * 上传文件到 IPFS (使用 Pinata)
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // 可选：添加元数据
    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append("pinataMetadata", metadata);

    const response = await fetch(PINATA_UPLOAD_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        // 注意：使用 FormData 时不要设置 Content-Type
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;

    // 返回 IPFS URI
    return `ipfs://${ipfsHash}`;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw error;
  }
}

/**
 * 上传 JSON metadata 到 IPFS
 */
export async function uploadMetadataToIPFS(
  metadata: NftMetadata
): Promise<string> {
  try {
    const response = await fetch(PINATA_JSON_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `${metadata.name}-metadata.json`,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;

    // 返回 IPFS URI
    return `ipfs://${ipfsHash}`;
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    throw error;
  }
}

/**
 * 完整的 NFT 上传流程
 * 1. 上传图片到 IPFS
 * 2. 创建 metadata
 * 3. 上传 metadata 到 IPFS
 * 4. 返回 metadata URI
 */
export async function uploadNftToIPFS(
  imageFile: File,
  metadata: Omit<NftMetadata, "image">,
  onProgress?: (step: string, progress: number) => void
): Promise<string> {
  try {
    // Step 1: 上传图片
    onProgress?.("Uploading image to IPFS...", 30);
    const imageUri = await uploadFileToIPFS(imageFile);

    // Step 2: 创建完整的 metadata
    onProgress?.("Creating metadata...", 60);
    const fullMetadata: NftMetadata = {
      ...metadata,
      image: imageUri,
    };

    // Step 3: 上传 metadata
    onProgress?.("Uploading metadata to IPFS...", 90);
    const metadataUri = await uploadMetadataToIPFS(fullMetadata);

    onProgress?.("Upload complete!", 100);
    return metadataUri;
  } catch (error) {
    console.error("Error in NFT upload process:", error);
    throw error;
  }
}

/**
 * 将 IPFS URI 转换为 HTTP URL (用于预览)
 */
export function ipfsToHttp(ipfsUri: string): string {
  if (!ipfsUri) return "";

  // 支持多种 IPFS URI 格式
  if (ipfsUri.startsWith("ipfs://")) {
    const hash = ipfsUri.replace("ipfs://", "");
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }

  if (ipfsUri.startsWith("ipfs/")) {
    const hash = ipfsUri.replace("ipfs/", "");
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }

  return ipfsUri;
}

/**
 * 验证图片文件
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // 检查文件类型
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Please upload JPEG, PNG, GIF, or WebP.",
    };
  }

  // 检查文件大小 (例如：最大 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size too large. Maximum size is 10MB.",
    };
  }

  return { valid: true };
}
