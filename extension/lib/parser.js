/**
 * Manuscript file parser — supports LaTeX, plain text, DOCX, and PDF.
 */

/**
 * Read a File object as text.
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Read a File object as ArrayBuffer.
 */
export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Detect file type from name and content.
 */
export function detectFileType(file, content) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.tex')) return 'latex';
  if (name.endsWith('.txt')) return 'text';
  if (name.endsWith('.docx')) return 'docx';
  if (name.endsWith('.pdf')) return 'pdf';
  if (content && (content.includes('\\documentclass') || content.includes('\\begin{document}'))) {
    return 'latex';
  }
  return 'text';
}

/**
 * Parse DOCX by extracting text from word/document.xml.
 */
export async function parseDocx(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

  // DOCX is a ZIP; locate document.xml within the binary stream.
  const docMarker = 'word/document.xml';
  const markerBytes = new TextEncoder().encode(docMarker);
  let startIdx = -1;
  for (let i = 0; i < bytes.length - markerBytes.length; i++) {
    let match = true;
    for (let j = 0; j < markerBytes.length; j++) {
      if (bytes[i + j] !== markerBytes[j]) { match = false; break; }
    }
    if (match) { startIdx = i; break; }
  }

  if (startIdx === -1) {
  // Fallback: scan for XML paragraph tags anywhere in the file
    const raw = text;
    const paragraphs = [...raw.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(m => m[1]);
    if (paragraphs.length > 0) return paragraphs.join('\n');
    throw new Error('Could not parse DOCX file. Try exporting as .tex or .txt.');
  }

  // Find local file header (PK\x03\x04) near the marker and extract XML
  const xmlChunks = [...text.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(m => m[1]);
  if (xmlChunks.length === 0) {
    throw new Error('No text content found in DOCX file.');
  }
  return xmlChunks.join(' ');
}

/**
 * Basic PDF text extraction from raw bytes (works for text-based PDFs).
 */
export function parsePdfText(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const raw = new TextDecoder('latin1').decode(bytes);
  const textParts = [];

  // Extract text between BT/ET blocks
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  while ((match = streamRegex.exec(raw)) !== null) {
    const stream = match[1];
    const tjRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
    let tj;
    while ((tj = tjRegex.exec(stream)) !== null) {
      textParts.push(tj[1].replace(/\\([()\\nrt])/g, (_, c) => {
        if (c === 'n') return '\n';
        if (c === 'r') return '\r';
        if (c === 't') return '\t';
        return c;
      }));
    }
    const arrayRegex = /\[(.*?)\]\s*TJ/gs;
    let arr;
    while ((arr = arrayRegex.exec(stream)) !== null) {
      const inner = arr[1];
      const strRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
      let s;
      while ((s = strRegex.exec(inner)) !== null) {
        textParts.push(s[1]);
      }
    }
  }

  if (textParts.length === 0) {
    // Fallback: grab readable ASCII sequences
    const readable = raw.match(/[\x20-\x7E]{4,}/g) || [];
    return readable.filter(s => !s.startsWith('/') && !s.includes('obj')).join(' ');
  }

  return textParts.join(' ');
}

/**
 * Main parse entry point.
 */
export async function parseManuscriptFile(file) {
  const name = file.name;
  let fileType = detectFileType(file, null);
  let rawText = '';

  if (fileType === 'docx' || fileType === 'pdf') {
    const buffer = await readFileAsArrayBuffer(file);
    if (fileType === 'docx') {
      rawText = await parseDocx(buffer);
    } else {
      rawText = parsePdfText(buffer);
    }
  } else {
    rawText = await readFileAsText(file);
    fileType = detectFileType(file, rawText);
  }

  return {
    fileName: name,
    fileType,
    rawText: rawText.trim(),
    parsedAt: new Date().toISOString()
  };
}
