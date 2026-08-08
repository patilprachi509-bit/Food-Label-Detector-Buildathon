const fs = require('fs');

async function testLive() {
  console.log("Testing live Vercel app...");
  
  const artifactDir = "C:/Users/Prachi/.gemini/antigravity/brain/d593696e-348d-492a-b19d-950170f83182/.user_uploaded";
  const files = fs.readdirSync(artifactDir);
  const imgFile = files.find(f => f.endsWith('.png') || f.endsWith('.jpg'));
  
  if (!imgFile) {
    console.error("No image found to test with.");
    return;
  }
  
  const imgPath = artifactDir + "/" + imgFile;
  const base64 = fs.readFileSync(imgPath, {encoding: 'base64'});
  const imgBase64 = base64; // DO NOT add data URI prefix
  
  const t0 = performance.now();
  const res = await fetch("https://food-label-detector-buildathon.vercel.app/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ frontBase64: imgBase64, ingredientsBase64: imgBase64 })
  });
  
  const t1 = performance.now();
  
  if (!res.ok) {
    const errText = await res.text();
    console.error("Live test failed with status:", res.status);
    console.error(errText.substring(0, 200));
    return;
  }
  
  const data = await res.json();
  console.log("--- TIMING DATA ---");
  console.log(JSON.stringify(data.timing, null, 2));
  console.log("--- TIMING DATA END ---");
  console.log("Total roundtrip time: " + Math.round(t1 - t0) + "ms");
}

testLive();
