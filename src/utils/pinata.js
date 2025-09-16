
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;


export async function uploadFileToPinata(file, name = null) {
  try {
    if (!PINATA_JWT) {
      throw new Error('Pinata JWT token not configured. Please set VITE_PINATA_JWT in your .env file');
    }

    const data = new FormData();
    data.append("file", file);
    
    if (name) {
      const metadata = JSON.stringify({
        name: name,
        keyvalues: {
          uploadedBy: "chat-dapp",
          timestamp: new Date().toISOString()
        }
      });
      data.append("pinataMetadata", metadata);
    }

    const options = JSON.stringify({
      cidVersion: 0,
    });
    data.append("pinataOptions", options);

    const request = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: data,
      }
    );

    if (!request.ok) {
      const errorData = await request.json();
      throw new Error(`Pinata upload failed: ${errorData.error || request.statusText}`);
    }

    const response = await request.json();
    
    return {
      success: true,
      ipfsHash: response.IpfsHash,
      pinSize: response.PinSize,
      timestamp: response.Timestamp
    };

  } catch (error) {
    console.error('Pinata upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}


export async function uploadImageForENS(file, ensName) {
  try {
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Image must be smaller than 5MB');
    }

    const result = await uploadFileToPinata(file, `${ensName}-profile-image`);
    
    if (result.success) {
      console.log(`Image uploaded for ${ensName}:`, result.ipfsHash);
    }

    return result;

  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export function getIPFSUrl(ipfsHash) {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
}


export async function uploadFileV3(file, name = null) {
  try {
    if (!PINATA_JWT) {
      throw new Error('Pinata JWT token not configured. Please set VITE_PINATA_JWT in your .env file');
    }

    const data = new FormData();
    data.append("file", file);
    
    if (name) {
      data.append("name", name);
    }

    const request = await fetch(
      "https://uploads.pinata.cloud/v3/files",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: data,
      }
    );

    if (!request.ok) {
      const errorData = await request.json();
      throw new Error(`Pinata v3 upload failed: ${errorData.error || request.statusText}`);
    }

    const response = await request.json();
    
    return {
      success: true,
      ipfsHash: response.data.cid,
      url: response.data.url,
      name: response.data.name,
      size: response.data.size
    };

  } catch (error) {
    console.error('Pinata v3 upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
