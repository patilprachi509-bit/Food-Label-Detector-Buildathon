const Tesseract = require('tesseract.js');
const fs = require('fs');

async function testOCR() {
  const startTotal = Date.now();
  console.log("Starting Tesseract benchmark...");
  
  // Dummy 1500px image (a solid white block for simple testing, or we can use sharp to make a real one)
  const base64Img = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABdwAAAXcCAYAAAD...'; // too long to mock, let's just make a small 100x100 and rely on initialization time
  const buffer = Buffer.alloc(1500 * 1500, 255); // Fake image buffer, Tesseract might reject it. We just care about initialization time mostly.

  // Let's test the initialization time
  const startInit = Date.now();
  const worker = await Tesseract.createWorker('eng', 1, {
    cachePath: require('os').tmpdir(),
    logger: m => console.log(m.status)
  });
  const endInit = Date.now();
  console.log(`Worker Initialization & Model Load took: ${(endInit - startInit) / 1000}s`);

  await worker.terminate();
}

testOCR();
