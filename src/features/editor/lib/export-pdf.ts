import type { JSONContent } from "@tiptap/react";
import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";

import { documentExtensions } from "../extensions";

const FRAME_ID = "lumen-pdf-export";

const PRINT_CSS = `
  @page { margin: 18mm 16mm; }
  html, body { background: #fff; color: #111; color-scheme: light; }
  body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .pdf-title { margin: 0 0 1.25rem; font-size: 2rem; line-height: 1.2; font-weight: 700; letter-spacing: -0.02em; }
  .tiptap-content h1, .tiptap-content h2, .tiptap-content h3 { break-after: avoid; }
  .tiptap-content pre, .tiptap-content blockquote, .tiptap-content li { break-inside: avoid; }
  .tiptap-content pre { white-space: pre-wrap; }
`;

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
  );
}

export type PrintableDocument = {
  title: string;
  content: JSONContent | null;
};

/**
 * Lays the document out in a hidden, script-free iframe with the app's own
 * typography and opens the browser's print dialog, where "Save as PDF"
 * produces a selectable, vector PDF. The note title becomes the file name.
 */
export async function exportDocumentToPdf({ title, content }: PrintableDocument) {
  document.getElementById(FRAME_ID)?.remove();

  const heading = title.trim() || "Untitled";
  const body = content ? renderToHTMLString({ content, extensions: documentExtensions }) : "";
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join("");
  const fontClasses = Array.from(document.documentElement.classList)
    .filter((name) => name !== "dark")
    .join(" ");

  const frame = document.createElement("iframe");
  frame.id = FRAME_ID;
  frame.setAttribute("aria-hidden", "true");
  frame.setAttribute("tabindex", "-1");
  // No allow-scripts: shared notes are other people's content.
  frame.setAttribute("sandbox", "allow-same-origin allow-modals");
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  frame.srcdoc = `<!doctype html><html lang="en" class="${escapeHtml(fontClasses)}"><head><meta charset="utf-8"><title>${escapeHtml(
    heading,
  )}</title>${styles}<style>${PRINT_CSS}</style></head><body><article><h1 class="pdf-title">${escapeHtml(
    heading,
  )}</h1><div class="tiptap-content">${body}</div></article></body></html>`;

  await new Promise<void>((resolve) => {
    frame.addEventListener("load", () => resolve(), { once: true });
    document.body.append(frame);
  });

  const printWindow = frame.contentWindow;
  if (!printWindow) throw new Error("Couldn't prepare the PDF");

  await frame.contentDocument?.fonts.ready;
  printWindow.addEventListener("afterprint", () => frame.remove(), { once: true });
  printWindow.focus();
  printWindow.print();
}
