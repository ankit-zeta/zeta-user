import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { RegisteredAction } from "convex/server";
import { GROWTH_RESOURCES } from "./growthResources";

function escapePdfText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

// Generates a minimal valid single-page PDF containing the given text lines.
function makePdf(lines: string[]): ArrayBuffer {
  const header = "%PDF-1.4\n";
  const objects: string[] = [];
  objects[1] = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  objects[2] = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  objects[3] =
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n";
  const streamBody = lines.map((l) => `(${escapePdfText(l)}) Tj T*`).join("\n");
  const stream = `BT\n/F1 9 Tf\n50 750 Td\n13 TL\n${streamBody}\nET\n`;
  objects[4] = `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
  objects[5] = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";

  let pdf = header;
  const offsets: number[] = [0, 0, 0, 0, 0, 0];
  for (let i = 1; i <= 5; i++) {
    offsets[i] = pdf.length;
    pdf += objects[i];
  }
  const xrefStart = pdf.length;
  pdf += "xref\n0 6\n0000000000 65535 f \n";
  for (let i = 1; i <= 5; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return new TextEncoder().encode(pdf).buffer as ArrayBuffer;
}

/**
 * Public entry point that rebuilds the Growth Professional (₹4,000)
 * program: generates the 28 Growth Bundle PDFs, stores them in Convex
 * storage (storage.store is only available in actions), then runs
 * growthSetup:upsertGrowthCurriculumDb to rebuild the curriculum.
 */
export const upsertGrowthCurriculum: RegisteredAction<
  "public",
  { token: string; resetUserProgress?: boolean },
  Promise<{
    message: string;
    modules: number;
    lessons: number;
    resources: number;
    totalMinutes: number;
    demoEnrolled: boolean;
  }>
> = action({
  args: {
    token: v.string(),
    resetUserProgress: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try {
      const resourceStorageIds: Record<string, string> = {};
      for (const resDef of GROWTH_RESOURCES) {
        const pdf = makePdf(resDef.pdfLines);
        const blob = new Blob([pdf], { type: "application/pdf" });
        const storageId = await ctx.storage.store(blob);
        resourceStorageIds[resDef.slug] = storageId;
      }

      return await ctx.runMutation(internal.growthSetup.upsertGrowthCurriculumDb, {
        token: args.token,
        resetUserProgress: args.resetUserProgress,
        resourceStorageIds,
      });
    } catch (err: any) {
      throw new Error(`upsertGrowthCurriculum failed: ${err?.message || String(err)}`);
    }
  },
});