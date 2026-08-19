import { jsPDF } from "jspdf";

/** Tiny class-name combiner */
export const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------- dates ---------------------------------- */

export const daysAgoISO = (days: number) =>
  new Date(Date.now() - days * 86400000).toISOString();

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
};

/* ------------------------------- text ----------------------------------- */

export const countWords = (text: string) =>
  text.trim() ? text.trim().split(/\s+/).length : 0;

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Cross-tool context: when a job analysis is created it is stashed here so
 * Resume Tools / Cover Letter / Interview can pre-fill from it (one brain).
 */
export const jobCtx = {
  set(a: any) {
    try { sessionStorage.setItem("acc:jobctx", JSON.stringify(a)); } catch { /* quota */ }
  },
  get(): any {
    try { return JSON.parse(sessionStorage.getItem("acc:jobctx") || "null"); } catch { return null; }
  },
  clear() { try { sessionStorage.removeItem("acc:jobctx"); } catch { /* noop */ } },
};

/** Deterministic 0..1 pseudo-random from a string seed */
export function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

/* ----------------------------- downloads -------------------------------- */

export function downloadFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Word-compatible .doc download (HTML payload opens cleanly in MS Word) */
export function downloadDocx(filename: string, title: string, htmlBody: string) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:Calibri,Arial,sans-serif;color:#14152e;line-height:1.55;font-size:11.5pt}
h1{font-size:17pt;margin:0 0 4pt}h2{font-size:12.5pt;color:#6227bd;border-bottom:1px solid #d8c8fa;padding-bottom:2pt;margin:14pt 0 6pt;text-transform:uppercase;letter-spacing:.4pt}
p{margin:4pt 0}ul{margin:4pt 0 8pt 16pt}</style></head><body>${htmlBody}</body></html>`;
  downloadFile(filename.endsWith(".doc") ? filename : `${filename}.doc`, html, "application/msword");
}

export type PdfBlock = { heading?: string; text?: string; bullet?: string[] };

/** Real client-side PDF export */
export function downloadPdf(filename: string, title: string, blocks: PdfBlock[]) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 52;
  let y = 60;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(20, 21, 46);
  doc.text(title, M, y);
  y += 8;
  doc.setDrawColor(98, 39, 189);
  doc.setLineWidth(2);
  doc.line(M, y, M + 64, y);
  y += 26;

  const ensure = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 56) {
      doc.addPage();
      y = 56;
    }
  };

  for (const b of blocks) {
    if (b.heading) {
      ensure(34);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(98, 39, 189);
      doc.text(b.heading.toUpperCase(), M, y);
      y += 16;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(31, 33, 64);
    if (b.text) {
      const lines = doc.splitTextToSize(b.text, W - M * 2);
      for (const ln of lines) {
        ensure(15);
        doc.text(ln, M, y);
        y += 14.5;
      }
      y += 6;
    }
    if (b.bullet) {
      for (const item of b.bullet) {
        const lines = doc.splitTextToSize(item, W - M * 2 - 14);
        ensure(15 * lines.length + 2);
        doc.setTextColor(139, 87, 227);
        doc.text("•", M + 2, y);
        doc.setTextColor(31, 33, 64);
        lines.forEach((ln: string, i: number) => {
          doc.text(ln, M + 14, y + i * 14.5);
        });
        y += 14.5 * lines.length + 3;
      }
      y += 4;
    }
  }
  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
