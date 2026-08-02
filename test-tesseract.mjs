import Tesseract from 'tesseract.js';

async function testOCR() {
  console.log("Starting Tesseract...");
  const base64Img = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const buffer = Buffer.from(base64Img.split(',')[1], 'base64');
  
  try {
    const worker = await Tesseract.createWorker('eng', 1, {
      cachePath: '/tmp',
      logger: m => console.log(m.status, Math.round(m.progress * 100) + '%')
    });
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    console.log("OCR Text:", text);
  } catch(e) {
    console.error("OCR Error:", e);
  }
}

testOCR();
