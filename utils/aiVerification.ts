// // utils/aiVerification.ts
// import axios from "axios";

// export interface VerificationResult {
//   authenticityScore: number; // 0 - 100
//   extractedText?: string;
//   details?: any;
// }

// export async function verifyDocument(
//   fileCid: string,
//   fileName: string
// ): Promise<VerificationResult> {
//   // Replace this with your server endpoint that runs OCR or forgery detection
//   const endpoint = process.env.NEXT_PUBLIC_API_BASE + "/api/verify" || "/api/verify";
//   const resp = await axios.post(endpoint, { cid: fileCid, name: fileName });
//   return resp.data as VerificationResult;
// }



// utils/aiVerification.ts

export interface VerificationResult {
  authenticityScore: number; // 0 - 100
  extractedText?: string;
  details?: any;
}

export async function verifyDocument(fileCid: string, fileName: string): Promise<VerificationResult> {
  // Simulate a delay for AI verification
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return a random authenticity score
  const score = Math.floor(Math.random() * 101); // 0-100

  return {
    authenticityScore: score,
    extractedText: `Mocked extracted text for ${fileName}`,
    details: { mock: true },
  };
}
