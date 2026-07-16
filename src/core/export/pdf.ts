import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont } from "pdf-lib";

import frauncesUrl from "../../assets/fonts/Fraunces.ttf?url";
import manropeUrl from "../../assets/fonts/Manrope.ttf?url";

import type { Passage } from "../bible/types";

export type PdfExportMode = "references" | "references-and-text";

export type PdfExportInput = {
  title: string;
  mode: PdfExportMode;
  passages: Passage[];
  generatedAt?: Date;
};

type PdfLine = {
  text: string;
  header?: boolean;
  size?: number;
};

type PdfFonts = {
  body: PDFFont;
  header: PDFFont;
};

const pageWidth = 612;
const pageHeight = 792;
const margin = 54;
const bodySize = 10;
const titleSize = 18;
const headerSize = 12;
const lineHeight = 15;
const bodyWeightOffset = 0.14;
const textColor = rgb(0.12, 0.16, 0.2);
const mutedColor = rgb(0.35, 0.4, 0.47);

export async function buildPassagePdf(input: PdfExportInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const fonts = await loadFonts(pdfDoc);
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  for (const line of buildLines(input)) {
    const size = line.size ?? (line.header ? headerSize : bodySize);
    const font = line.header ? fonts.header : fonts.body;
    const color = line.header ? textColor : mutedColor;
    const wrapped = line.text ? wrapLine(line.text, font, size, pageWidth - margin * 2) : [""];

    for (const text of wrapped) {
      if (y < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      if (text) {
        page.drawText(text, { x: margin, y, size, font, color });
        if (!line.header) {
          page.drawText(text, { x: margin + bodyWeightOffset, y, size, font, color });
        }
      }
      y -= line.header ? lineHeight + 2 : lineHeight;
    }
  }

  return pdfDoc.save();
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

async function loadFonts(pdfDoc: PDFDocument): Promise<PdfFonts> {
  const [bodyBytes, headerBytes] = await Promise.all([fetchFont(manropeUrl), fetchFont(frauncesUrl)]);

  return {
    body: await pdfDoc.embedFont(bodyBytes, { subset: true }),
    header: await pdfDoc.embedFont(headerBytes, { subset: true }),
  };
}

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load PDF font: ${url}`);
  }

  return response.arrayBuffer();
}

function buildLines(input: PdfExportInput): PdfLine[] {
  const generatedAt = input.generatedAt ?? new Date();
  const lines: PdfLine[] = [
    { text: input.title || "Sermon Passages", header: true, size: titleSize },
    { text: `World English Bible passages prepared ${generatedAt.toLocaleDateString()}`, header: true },
    { text: "World English Bible, public domain. Source: https://ebible.org/engwebp/", header: true },
    { text: "" },
  ];

  if (input.passages.length === 0) {
    lines.push({ text: "No approved passages selected." });
    return lines;
  }

  for (const passage of input.passages) {
    lines.push({ text: passage.normalized, header: true });

    if (input.mode === "references-and-text") {
      for (const verse of passage.verses) {
        lines.push({ text: `${verse.chapter}:${verse.verse} ${verse.text}` });
      }
    }

    lines.push({ text: "" });
  }

  return lines;
}

function wrapLine(line: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = line.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
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
