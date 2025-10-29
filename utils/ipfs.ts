// // utils/ipfs.ts
// import { Web3Storage } from "web3.storage";

// const token = process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN;
// if (!token) throw new Error("Missing NEXT_PUBLIC_WEB3STORAGE_TOKEN in .env.local");

// const client = new Web3Storage({ token });

// export async function uploadToIPFS(
//   file: File,
//   onProgress?: (sentBytes: number, totalBytes: number) => void
// ) {
//   const cid = await client.put([file], {
//     onStoredChunk: (size) => {
//       if (onProgress) onProgress(size, file.size);
//     },
//   });
//   return {
//     cid,
//     url: `https://${cid}.ipfs.dweb.link/${encodeURIComponent(file.name)}`,
//   };
// }
////////////////////////////////////////////////////////////////////////////////////////////////////



// utils/ipfs.ts

export async function uploadToIPFS(
  file: File,
  onProgress?: (sentBytes: number, totalBytes: number) => void
) {
  // Simulate progress
  if (onProgress) {
    let sent = 0;
    const total = file.size;
    const interval = setInterval(() => {
      sent += total / 10;
      if (sent >= total) {
        sent = total;
        clearInterval(interval);
      }
      onProgress(sent, total);
    }, 100);
  }

  // Simulate delay for upload
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return a fake IPFS URL
  const fakeCid = "bafybeifakedocumentcid123456";
  return {
    cid: fakeCid,
    url: `https://${fakeCid}.ipfs.dweb.link/${encodeURIComponent(file.name)}`,
  };
}
