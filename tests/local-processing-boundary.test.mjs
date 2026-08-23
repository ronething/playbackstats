import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import test from "node:test"

const localImportFiles = [
  "../components/file-upload-form.tsx",
  "../lib/youtube-import.ts",
  "../lib/youtube-analysis.ts",
  "../lib/youtube-share-card.ts",
  "../components/spotify/spotify-upload.tsx",
  "../lib/spotify-import.ts",
  "../lib/spotify-analysis.ts",
  "../lib/spotify-links.ts",
  "../lib/spotify-share-card.ts",
]

test("history import and analysis paths contain no network transmission primitive", () => {
  for (const relativePath of localImportFiles) {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8")
    assert.doesNotMatch(source, /\bfetch\s*\(/, `${relativePath} must not call fetch`)
    assert.doesNotMatch(source, /\bXMLHttpRequest\b/, `${relativePath} must not use XMLHttpRequest`)
    assert.doesNotMatch(source, /\bsendBeacon\s*\(/, `${relativePath} must not use sendBeacon`)
    assert.doesNotMatch(source, /\bFormData\s*\(/, `${relativePath} must not construct an upload body`)
  }
})

test("the application has no server-side file upload route", () => {
  assert.equal(existsSync(new URL("../app/api", import.meta.url)), false)
})
