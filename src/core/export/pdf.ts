import type { Passage } from "../bible/types";

export type PdfExportMode = "references" | "references-and-text";

export type PdfExportInput = {
  title: string;
  mode: PdfExportMode;
  passages: Passage[];
  generatedAt?: Date;
};

const pageWidth = 612;
const pageHeight = 792;
const margin = 54;
const lineHeight = 14;
const bodySize = 10;

type PdfLine = {
  text: string;
  bold?: boolean;
};

export function buildPassagePdf(input: PdfExportInput): Uint8Array {
  const lines = buildLines(input);
  const pages = paginate(lines, 48);
  const pageCount = Math.max(1, pages.length);
  const objects: string[] = [];
  const pageIds = Array.from({ length: pageCount }, (_, index) => 5 + index);
  const contentIds = Array.from({ length: pageCount }, (_, index) => 5 + pageCount + index);

  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Count ${pageCount} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`;
  objects[2] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  for (let index = 0; index < pageCount; index += 1) {
    const pageId = pageIds[index];
    const contentId = contentIds[index];
    objects[pageId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    const stream = renderPage(pages[index] ?? []);
    objects[contentId - 1] = `<< /Length ${byteLength(stream)} >>\nstream\n${stream}\nendstream`;
  }

  return encodePdf(objects);
}

export function downloadPdf(bytes: Uint8Array, fileName = "sermon-passages.pdf"): void {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  const blob = new Blob([copy.buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildLines(input: PdfExportInput): PdfLine[] {
  const generatedAt = input.generatedAt ?? new Date();
  const lines = [
    { text: input.title || "Sermon Passages", bold: true },
    { text: `World English Bible passages prepared ${generatedAt.toLocaleDateString()}`, bold: true },
    { text: "World English Bible, public domain. Source: https://ebible.org/engwebp/", bold: true },
    { text: "" },
  ];

  if (input.passages.length === 0) {
    lines.push({ text: "No approved passages selected." });
    return lines;
  }

  for (const passage of input.passages) {
    lines.push({ text: passage.normalized, bold: true });

    if (input.mode === "references-and-text") {
      for (const verse of passage.verses) {
        lines.push(...wrapLine(`${verse.chapter}:${verse.verse} ${verse.text}`, 92).map((text) => ({ text })));
      }
    }

    lines.push({ text: "" });
  }

  return lines;
}

function paginate(lines: PdfLine[], maxLinesPerPage: number): PdfLine[][] {
  const pages: PdfLine[][] = [];
  for (let index = 0; index < lines.length; index += maxLinesPerPage) {
    pages.push(lines.slice(index, index + maxLinesPerPage));
  }

  return pages;
}

function renderPage(lines: PdfLine[]): string {
  const commands = ["BT", `/F1 ${bodySize} Tf`, `${margin} ${pageHeight - margin} Td`];
  let currentFont = "F1";

  lines.forEach((line, index) => {
    if (index > 0) {
      commands.push(`0 -${lineHeight} Td`);
    }
    const nextFont = line.bold ? "F2" : "F1";
    if (nextFont !== currentFont) {
      commands.push(`/${nextFont} ${bodySize} Tf`);
      currentFont = nextFont;
    }
    commands.push(`(${escapePdfText(line.text)}) Tj`);
  });

  commands.push("ET");
  return commands.join("\n");
}

function wrapLine(line: string, maxLength: number): string[] {
  const words = line.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLength) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
      }
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function escapePdfText(value: string): string {
  return sanitizePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function sanitizePdfText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E]/g, "");
}

function encodePdf(objects: string[]): Uint8Array {
  const encoder = new TextEncoder();
  const parts: string[] = ["%PDF-1.4\n"];
  const offsets = [0];
  let position = byteLength(parts[0]);

  objects.forEach((object, index) => {
    offsets.push(position);
    const part = `${index + 1} 0 obj\n${object}\nendobj\n`;
    parts.push(part);
    position += byteLength(part);
  });

  const xrefStart = position;
  const xref = [
    `xref\n0 ${objects.length + 1}\n`,
    "0000000000 65535 f \n",
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`),
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`,
  ].join("");
  parts.push(xref);

  return encoder.encode(parts.join(""));
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}
