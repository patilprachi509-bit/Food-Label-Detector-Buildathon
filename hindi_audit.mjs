import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

// Check all .tsx and .ts files
const checkDir = (dir) => {
  walk(dir, (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, i) => {
      // Very crude check for strings containing english words but not 'isEn' or 'hi'
      // to spot things we missed.
      // Also look for literal JSX text nodes.
      const match = line.match(/>([^<>{}\n]+)</);
      if (match) {
        const text = match[1].trim();
        if (text.length > 2 && /[a-zA-Z]/.test(text) && !text.includes('&')) {
          console.log(`[JSX Text] ${filePath}:${i+1} -> ${text}`);
        }
      }

      // Check for raw text inside expressions {"Like this"}
      const exprMatch = line.match(/\{(['"])([^'"]*[a-zA-Z]{3,}[^'"]*)\1\}/);
      if (exprMatch && !line.includes('isEn')) {
        console.log(`[JSX Expr] ${filePath}:${i+1} -> ${exprMatch[2]}`);
      }
      
      // Look for things like return "Grade A"
      if (line.includes('return "') || line.includes("return '")) {
        if (!line.includes('isEn') && /[a-zA-Z ]{4,}/.test(line)) {
            console.log(`[Return Str] ${filePath}:${i+1} -> ${line.trim()}`);
        }
      }
    });
  });
};

checkDir('src/components');
checkDir('src/utils');
checkDir('src');
