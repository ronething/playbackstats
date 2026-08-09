# Issue #22 measurement and privacy contract

## Event dictionary

| Event | Trigger | Required context |
| --- | --- | --- |
| `sample_report_opened` | A visitor opens the synthetic YouTube report | platform, input format, source page |
| `takeout_guide_opened` | The dedicated Takeout guide is rendered | platform, source page |
| `history_file_selected` | A local file or file set is chosen | platform, coarse file-size bucket, source page |
| `history_parse_started` | Local parsing begins | platform, input format, coarse file-size bucket |
| `history_parse_succeeded` | A supported export produces a dashboard | platform, input format, coarse size/count/time buckets |
| `history_parse_failed` | Validation, parsing, memory, storage, or browser handling fails | platform, input format when known, fixed error code |
| `dashboard_viewed` | A valid or sample dashboard is shown | platform, input format, coarse record-count bucket |
| `share_started` | Native sharing or link copying starts | platform, source page |
| `share_completed` | Native sharing resolves or the public homepage link is copied | platform, source page |
| `donation_clicked` | A Ko-fi call to action is activated | platform, source page |
| `pro_interest_clicked` | Interest in the one-time advanced export direction is recorded | platform, source page |

The only accepted property names are `platform`, `input_format`, `file_size_bucket`, `record_count_bucket`, `processing_time_bucket`, `error_code`, and `source_page`. Every property also has a fixed value allowlist in `lib/analytics.ts`.

Filenames, titles, channels, artists, URLs from imported records, exact timestamps, account identifiers, raw records, and complete results are forbidden. Runtime sanitization is retained even though TypeScript already restricts callers.

## Error codes

- `unsupported_format`: wrong extension, unsupported ZIP features/compression, or a non-history export format.
- `malformed_json`: JSON syntax cannot be decoded.
- `incorrect_takeout_path`: JSON has the wrong collection shape or a ZIP lacks the expected history path.
- `empty_history`: a recognized collection has no supported viewing records.
- `memory_exhaustion`: a configured JSON/ZIP limit, browser memory, or session storage limit is exceeded.
- `browser_failure`: an unexpected local file, decoding, or storage failure.

## Baseline and release measurement

Use the first 14 complete UTC days after deployment as the immutable baseline. Calculate `dashboard_viewed / history_file_selected` separately for `platform=youtube` and `platform=spotify`; do not combine them. Compare the next complete 14-day window against that baseline and require a relative improvement of at least 20% for the YouTube funnel.

Also report `history_parse_succeeded / history_parse_started` and failure-code distribution. Fixture success is a release check, not a substitute for production parse success.

## Privacy verification

For both JSON and ZIP paths, inspect browser network requests from selection through dashboard rendering. The selected file bytes, parsed records, titles, channels, timestamps, and generated result objects must not appear in requests. Plausible custom-event requests may contain only the fixed event names and allowlisted coarse properties above.

Stop or disable an event immediately if a forbidden value appears. Do not add a file-processing API or a server renderer for ZIPs or share cards.

## ZIP safety limits

- Compressed archive: 100 MB
- Archive file count: 5,000
- Individual uncompressed entry: 100 MB
- Total declared uncompressed size: 250 MB
- ZIP64, multi-disk, encrypted entries, and unsupported compression methods: rejected

The central directory is validated before only the selected `history/watch-history.json` entry is decompressed. Other archive entries are never inflated.

## Operational work that code cannot close

- Record and review the 14-day baseline and subsequent 14-day comparison.
- Run fixtures and browser privacy inspection monthly.
- Capture parse duration and peak memory by fixture size and representative device class, then investigate regressions over 20%.
- Review Search Console queries, CTR, rank, and cannibalization every 28 days.
- Review dependencies, security alerts, export schemas, and browser compatibility quarterly.
- Do not buy traffic until real purchases and contribution margin are measurable.
