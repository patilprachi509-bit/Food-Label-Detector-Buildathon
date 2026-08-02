import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs';

async function downloadImage(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function runTests() {
  console.log("Downloading reference image...");
  // Clear image
  const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/4/4b/Ingredients_label.jpg";
  const clearBuffer = await downloadImage(imageUrl);

  console.log("Generating 800px compressed image...");
  const compressedBuffer = await sharp(clearBuffer)
    .resize({ width: 800 })
    .jpeg({ quality: 60 }) // matching the 0.6 quality in CameraCapture
    .toBuffer();

  fs.writeFileSync('compressed_test.jpg', compressedBuffer);

  console.log("Running Tesseract on FULL RES image...");
  try {
    const worker = await Tesseract.createWorker('eng');
    const clearResult = await worker.recognize(clearBuffer);
    console.log("--- FULL RES TEXT ---");
    console.log(clearResult.data.text.trim().substring(0, 100) + '...');
    await worker.terminate();
  } catch (e) {
    console.error("Error on clear image:", e);
  }

  console.log("\nRunning Tesseract on 800px 0.6 quality image...");
  try {
    const worker = await Tesseract.createWorker('eng');
    const blurryResult = await worker.recognize(compressedBuffer);
    console.log("--- 800px TEXT ---");
    console.log(blurryResult.data.text.trim().substring(0, 100) + '...');
    await worker.terminate();
  } catch (e) {
    console.error("Error on blurry image:", e);
  }
}

runTests();
