import vision from "@google-cloud/vision";
import * as fs from "fs";
import * as path from "path";

let client: vision.ImageAnnotatorClient;

function initializeClient() {
  if (client) return client;

  // Handle both local dev and Vercel
  if (process.env.GOOGLE_CLOUD_KEY_FILE_B64) {
    // Vercel: decode from env var
    const keyBuffer = Buffer.from(
      process.env.GOOGLE_CLOUD_KEY_FILE_B64,
      "base64"
    );
    const keyPath = path.join("/tmp", "gcp-key.json");
    fs.writeFileSync(keyPath, keyBuffer);
    client = new vision.ImageAnnotatorClient({
      keyFilename: keyPath,
    });
  } else if (process.env.GOOGLE_CLOUD_KEY_FILE) {
    // Local dev: use file path
    client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    });
  } else {
    throw new Error("Google Cloud credentials not configured");
  }

  return client;
}

export async function checkImageSafety(imageUrl: string) {
  try {
    const visionClient = initializeClient();
    const [result] = await visionClient.safeSearchDetection(imageUrl);
    const detection = result.safeSearchAnnotation;

    // Likelihood: UNKNOWN, VERY_UNLIKELY, UNLIKELY, POSSIBLE, LIKELY, VERY_LIKELY
    const isBlocked =
      detection?.adult === "POSSIBLE" ||
      detection?.adult === "LIKELY" ||
      detection?.adult === "VERY_LIKELY" ||
      detection?.racy === "POSSIBLE" ||
      detection?.racy === "LIKELY" ||
      detection?.racy === "VERY_LIKELY" ||
      detection?.violence === "LIKELY" ||
      detection?.violence === "VERY_LIKELY";

    return {
      safe: !isBlocked,
      detection: {
        adult: detection?.adult,
        racy: detection?.racy,
        violence: detection?.violence,
      },
    };
  } catch (error) {
    console.error("Vision API error:", error);
    // Fail closed: reject on error (safe for moderation)
    return {
      safe: false,
      detection: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
