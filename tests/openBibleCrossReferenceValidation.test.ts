import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

type ValidationReport = {
  catalog: {
    sourceBookCount: number;
    targetBookCount: number;
  };
  examples: Array<{
    label: string;
    status: string;
  }>;
  records: {
    distinctRecordCount: number;
    inputLineCount: number;
    invalidReasonCounts: Record<string, number>;
    invalidRecordCount: number;
    maximumScore: number;
    minimumScore: number;
    normalizedRecordCount: number;
    targetRangeCount: number;
  };
};

type NormalizedDataset = {
  metadata: {
    archiveDate: string;
    excludedRecordCount: number;
    includedRecordCount: number;
    license: string;
    relationship: string;
  };
  references: Record<string, Array<{ score: number; target: string }>>;
  schemaVersion: number;
};

function runValidator(): ValidationReport {
  const scriptPath = resolve(
    process.cwd(),
    "scripts/validate-openbible-cross-references.mjs",
  );
  const fixturePath = resolve(
    process.cwd(),
    "tests/fixtures/openbible-cross-references.sample.txt",
  );
  const output = execFileSync(process.execPath, [scriptPath, fixturePath, "--json"], {
    encoding: "utf8",
  });

  return JSON.parse(output) as ValidationReport;
}

describe("OpenBible cross-reference validation prototype", () => {
  it("normalizes known links, ranges, and signed vote scores", () => {
    const report = runValidator();

    expect(report.records.inputLineCount).toBe(8);
    expect(report.records.normalizedRecordCount).toBe(5);
    expect(report.records.distinctRecordCount).toBe(5);
    expect(report.records.invalidRecordCount).toBe(2);
    expect(report.records.targetRangeCount).toBe(1);
    expect(report.records.minimumScore).toBe(-2);
    expect(report.records.maximumScore).toBe(389);
  });

  it("reports catalog incompatibilities without treating them as unknown books", () => {
    const report = runValidator();

    expect(report.records.invalidReasonCounts["catalog-verse-mismatch"]).toBe(1);
    expect(
      report.records.invalidReasonCounts["cross-book-or-reversed-target-range"],
    ).toBe(1);
    expect(report.catalog.sourceBookCount).toBe(4);
    expect(report.catalog.targetBookCount).toBe(4);
  });

  it("finds the requested known examples", () => {
    const report = runValidator();

    expect(report.examples.map(({ label, status }) => ({ label, status }))).toEqual([
      { label: "Matthew 4:4 to Deuteronomy 8:3", status: "present" },
      { label: "Romans 4:3 to Genesis 15:6", status: "present" },
      { label: "Hebrews 1:5 to Psalm 2:7", status: "present" },
    ]);
  });

  it("writes a source-indexed dataset with attribution metadata", () => {
    const outputDirectory = mkdtempSync(join(tmpdir(), "sermon-prep-openbible-import-"));
    const outputPath = join(outputDirectory, "openbible.json");
    const scriptPath = resolve(
      process.cwd(),
      "scripts/validate-openbible-cross-references.mjs",
    );
    const fixturePath = resolve(
      process.cwd(),
      "tests/fixtures/openbible-cross-references.sample.txt",
    );

    try {
      execFileSync(process.execPath, [scriptPath, fixturePath, "--output", outputPath]);
      const dataset = JSON.parse(readFileSync(outputPath, "utf8")) as NormalizedDataset;

      expect(dataset.schemaVersion).toBe(1);
      expect(dataset.metadata).toMatchObject({
        archiveDate: "2026-07-27",
        excludedRecordCount: 2,
        includedRecordCount: 5,
        license: "CC BY",
        relationship: "related",
      });
      expect(dataset.references["matthew.4.4"][0]).toEqual({
        target: "deuteronomy.8.3",
        score: 389,
      });
      expect(dataset.references["genesis.1.1"]).toEqual([
        { target: "colossians.1.16-colossians.1.17", score: 167 },
        { target: "psalms.33.6", score: -2 },
      ]);
    } finally {
      rmSync(outputDirectory, { force: true, recursive: true });
    }
  });
});
