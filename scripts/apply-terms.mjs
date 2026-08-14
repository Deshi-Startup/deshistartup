import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const termsMap = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/glossary.json'), 'utf-8'));
const termVariants = {
  "authorized-capital": ["authorized capital", "authorised capital", "অনুমোদিত মূলধন"],
  "paid-up-capital": ["paid-up capital", "paid up capital", "পরিশোধিত মূলধন"],
  "form-xii": ["Form XII", "Form-XII", "ফরম ১২", "ফরম-১২"],
  "form-117": ["Form 117", "Form-117", "ফরম ১১৭", "ফরম-১১৭"],
  "moa-aoa": ["Memorandum of Association", "Articles of Association", "MoA", "AoA"],
  "rjsc-name-clearance": ["RJSC name clearance", "name clearance", "নামের ছাড়পত্র", "নাম ছাড়পত্র"],
  "e-tin": ["e-TIN", "TIN", "ই-টিন", "টিন", "টিন (TIN)"],
  "vat-bin": ["VAT registration", "VAT BIN", "BIN", "ভ্যাট নিবন্ধন", "ভ্যাট রেজিস্ট্রেশন", "বিআইএন"],
  "trade-license": ["trade license", "Trade license", "Trade License", "ট্রেড লাইসেন্স", "ট্রেড লাইসেন্স (Trade License)"],
  "encashment-certificate": ["encashment certificate", "Encashment Certificate", "এনক্যাশমেন্ট সার্টিফিকেট", "এনক্যাশমেন্ট সনদ"],
  "mfs": ["MFS", "Mobile Financial Service", "এমএফএস", "মোবাইল ফিনান্সিয়াল সার্ভিস"],
  "cod": ["cash on delivery", "Cash on delivery", "COD", "ক্যাশ অন ডেলিভারি"],
  "vesting": ["vesting", "Vesting", "ভেস্টিং"],
  "cap-table": ["cap table", "Cap table", "Cap Table", "ক্যাপ টেবিল"],
  "bida-oss": ["BIDA OSS", "BIDA One Stop Service"],
  "board-resolution": ["board resolution", "Board resolution", "Board Resolution", "বোর্ড রেজল্যুশন", "বোর্ড রেজুলেশন"],
  "withholding-tax": ["withholding tax", "Withholding tax", "Withholding Tax", "উৎস কর"],
  "corporate-tax": ["corporate tax", "Corporate tax", "Corporate Tax", "করপোরেট কর", "কর্পোরেট কর", "করপোরেট ট্যাক্স"],
  "share-transfer": ["share transfer", "Share transfer", "শেয়ার হস্তান্তর"],
  "incorp-certificate": ["certificate of incorporation", "Certificate of Incorporation", "incorporation certificate", "নিবন্ধন সনদ", "ইনকর্পোরেশন সার্টিফিকেট"]
};

const termRegexes = [];
for (const key of Object.keys(termsMap)) {
  const variants = termVariants[key];
  if (!variants) continue;
  
  for (const variant of variants) {
    const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const isEng = /^[A-Za-z0-9\s-]+$/.test(variant);
    let regexStr = '';
    if (isEng) {
      regexStr = `\\b${escaped}\\b`;
    } else {
      regexStr = `(?<=[\\s>.,;("']|^)${escaped}(?=[\\s<.,;)?"']|$)`;
    }
    termRegexes.push({
      key,
      variant,
      regex: new RegExp(regexStr, 'g')
    });
  }
}
termRegexes.sort((a, b) => b.variant.length - a.variant.length);

function getMdxFiles(dir, filesList = []) {
  if (!fs.existsSync(dir)) return filesList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getMdxFiles(fullPath, filesList);
    } else if (fullPath.endsWith('.mdx')) {
      filesList.push(fullPath);
    }
  }
  return filesList;
}

const files = [
  ...getMdxFiles(path.join(rootDir, 'app/(contents)/(bn)')),
  ...getMdxFiles(path.join(rootDir, 'app/(contents)/en'))
];

let changedFilesCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;
  
  const usedTerms = new Set();
  const existingTermMatches = content.matchAll(/<Term name="([^"]+)">/g);
  for (const match of existingTermMatches) {
    usedTerms.add(match[1]);
  }

  const tokens = [];
  const blockPattern = /(```[\s\S]*?```)|(<Term\b[^>]*>[\s\S]*?<\/Term>)|(<[^>]+>)|(`[^`\n]+`)|(\[[^\]]+\]\([^)]+\))|(^#+\s+.*$)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(>\s+\*\*[^:]+:\*\*)/gm;

  // Frontmatter is protected separately: with the m flag, ^--- would also
  // match the --- section separators in the body and swallow whole sections.
  const frontmatter = content.match(/^---\n[\s\S]*?\n---/);
  let lastIndex = 0;
  if (frontmatter) {
    tokens.push({ type: 'protected', value: frontmatter[0] });
    lastIndex = frontmatter[0].length;
  }
  blockPattern.lastIndex = lastIndex;
  let match;
  while ((match = blockPattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    tokens.push({ type: 'protected', value: match[0] });
    lastIndex = blockPattern.lastIndex;
  }
  if (lastIndex < content.length) {
    tokens.push({ type: 'text', value: content.slice(lastIndex) });
  }

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'text') {
      let text = tokens[i].value;
      for (const { key, regex } of termRegexes) {
        if (usedTerms.has(key)) continue;
        regex.lastIndex = 0;
        const textMatch = regex.exec(text);
        if (textMatch) {
          text = text.substring(0, textMatch.index) + 
                 `<Term name="${key}">${textMatch[0]}</Term>` + 
                 text.substring(textMatch.index + textMatch[0].length);
          usedTerms.add(key);
        }
      }
      tokens[i].value = text;
    }
  }

  const newContent = tokens.map(t => t.value).join('');
  if (newContent !== originalContent) {
    fs.writeFileSync(file, newContent, 'utf-8');
    changedFilesCount++;
    console.log(`Updated terms in: ${file.replace(rootDir, '')}`);
  }
}

if (changedFilesCount > 0) {
  console.log(`\n✅ Total files updated: ${changedFilesCount}`);
} else {
  console.log('✅ All terms are appropriately tagged. No files were changed.');
}
