import Tesseract from 'tesseract.js';
import sharp from 'sharp';

async function downloadImage(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function runTests() {
  console.log("Downloading reference image...");
  // A standard ingredient label from wikipedia
  const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/4/4b/Ingredients_label.jpg";
  const clearBuffer = await downloadImage(imageUrl);

  console.log("Generating blurry image...");
  const blurryBuffer = await sharp(clearBuffer)
    .blur(15) // Apply strong blur
    .toBuffer();

  console.log("Running Tesseract on CLEAR image...");
  try {
    const clearResult = await Tesseract.recognize(clearBuffer, 'eng');
    console.log("--- CLEAR TEXT ---");
    console.log(clearResult.data.text.trim());
    console.log("------------------");
  } catch (e) {
    console.error("Error on clear image:", e);
  }

  console.log("Running Tesseract on BLURRY image...");
  try {
    const blurryResult = await Tesseract.recognize(blurryBuffer, 'eng');
    console.log("--- BLURRY TEXT ---");
    console.log(blurryResult.data.text.trim());
    console.log("-------------------");
  } catch (e) {
    console.error("Error on blurry image:", e);
  }
}

runTests();
