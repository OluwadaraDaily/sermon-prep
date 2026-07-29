# OpenBible Cross-Reference Validation

This document records the Step 1 source validation for the offline related-passage prototype.

Run the validator with the downloaded archive:

```sh
node scripts/validate-openbible-cross-references.mjs /path/to/cross-references.zip
```

The validator reads the archive but does not copy the cross-reference data into the application bundle.

## Source decision

OpenBible is suitable as an initial offline source for a ranked **Related passages** layer:

- The archive contains tab-separated `cross_references.txt` data.
- Each row has a single source verse, a target verse or verse range, and a numeric vote count.
- The source describes the data as connections involving themes, words, events, and people.
- The data does not provide a reliable relationship type for distinguishing direct quotations from broader related passages.
- The data is licensed under CC BY, so attribution must remain with any bundled derivative dataset.

The application should not label every result as “quoted from” or “explicitly cited.” A future manually verified overlay may add those stronger relationship labels.

## Validation result

The archive inspected on 2026-07-29 contained:

- 344,799 source data rows.
- 344,583 rows normalized successfully against the current WEB catalog.
- 216 rows rejected as local catalog or representation mismatches: 202 catalog verse mismatches (mostly Romans 16 references beyond the bundled catalog’s 24 verses), and 14 cross-book target ranges that the current single-book target shape cannot represent.
- 66 source books and 66 target books, matching the current WEB Protestant catalog.
- Single-verse sources and single-verse or explicit-range targets.
- Vote scores may be signed because downvotes are represented as negative values; the score is preserved as `score` and the raw count as `votes` in the prototype record.
- All 66 source and target book identifiers resolved. The rejected rows are not unknown-book records; they expose versification and range-shape differences that must be handled before any future full bundle import.

Known examples were present:

- `Matthew 4:4 → Deuteronomy 8:3` — 389 votes.
- `Romans 4:3 → Genesis 15:6` — 34 votes.
- `Hebrews 1:5 → Psalm 2:7` — 71 votes.

The archive size was approximately 1.9 MB compressed and 8.3 MB uncompressed, making offline bundling technically practical. Step 2 generates a 14.3 MB local normalized dataset at data/cross-references/openbible.json.

The generated dataset contains one lookup entry per canonical source verse, related target references sorted by signed vote score, and source attribution metadata. Regenerate it from a newer archive with:

node scripts/validate-openbible-cross-references.mjs /path/to/cross-references.zip --output data/cross-references/openbible.json

The dataset is local but is not connected to the application UI yet; that is the following step.

## Attribution

OpenBible’s cross-reference documentation states that the data is primarily drawn from public-domain sources, especially the Treasury of Scripture Knowledge, and that the data is licensed under a Creative Commons Attribution license:

- <https://www.openbible.info/labs/cross-references/>
- <https://www.openbible.info/download.htm>
