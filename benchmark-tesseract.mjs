import Tesseract from 'tesseract.js';
import sharp from 'sharp';

async function runBenchmark() {
  console.log("Downloading random 1800px test image...");
  let buffer;
  try {
    const res = await fetch("https://picsum.photos/1800/1800");
    const arrayBuffer = await res.arrayBuffer();
    buffer = await sharp(Buffer.from(arrayBuffer)).jpeg({ quality: 80 }).toBuffer();
    console.log("Image downloaded and prepared. Size:", (buffer.length / 1024).toFixed(2), "KB");
  } catch (e) {
    console.error("Failed to download image", e);
    return;
  }

  console.log("\n--- BENCHMARK 1: COLD START ---");
  const coldStart = Date.now();
  let worker1;
  try {
    worker1 = await Tesseract.createWorker('eng', 1, {
      logger: m => {} 
    });
    const initEnd = Date.now();
    console.log(`Cold Initialization (load wasm & data): ${((initEnd - coldStart) / 1000).toFixed(2)}s`);
    
    await worker1.recognize(buffer);
    const recogEnd = Date.now();
    console.log(`Recognition time: ${((recogEnd - initEnd) / 1000).toFixed(2)}s`);
    console.log(`Total Cold Start Time: ${((recogEnd - coldStart) / 1000).toFixed(2)}s`);
  } finally {
    if (worker1) await worker1.terminate();
  }

  console.log("\n--- BENCHMARK 2: WARM START (Cached Data) ---");
  const warmStart = Date.now();
  let worker2;
  try {
    worker2 = await Tesseract.createWorker('eng', 1, {
      logger: m => {}
    });
    const initEnd = Date.now();
    console.log(`Warm Initialization: ${((initEnd - warmStart) / 1000).toFixed(2)}s`);
    
    await worker2.recognize(buffer);
    const recogEnd = Date.now();
    console.log(`Recognition time: ${((recogEnd - initEnd) / 1000).toFixed(2)}s`);
    console.log(`Total Warm Start Time: ${((recogEnd - warmStart) / 1000).toFixed(2)}s`);
  } finally {
    if (worker2) await worker2.terminate();
  }
}

runBenchmark();
