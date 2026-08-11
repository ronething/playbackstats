import { inflate } from "fflate"

export const YOUTUBE_IMPORT_LIMITS = {
  jsonBytes: 100 * 1024 * 1024,
  archiveBytes: 100 * 1024 * 1024,
  fileCount: 5_000,
  entryBytes: 100 * 1024 * 1024,
  totalUncompressedBytes: 250 * 1024 * 1024,
} as const

export type YoutubeInputFormat = "youtube_json" | "takeout_zip"
export type YoutubeImportErrorCode =
  | "unsupported_format"
  | "malformed_json"
  | "incorrect_takeout_path"
  | "empty_history"
  | "memory_exhaustion"
  | "browser_failure"

export interface ParsedYoutubeImport {
  records: Record<string, unknown>[]
  inputFormat: YoutubeInputFormat
}

export interface ImportErrorGuidance {
  title: string
  message: string
  action: string
}

interface ZipEntry {
  name: string
  flags: number
  compressionMethod: number
  compressedSize: number
  uncompressedSize: number
  localHeaderOffset: number
}

const ZIP_LOCAL_FILE_HEADER = 0x04034b50
const ZIP_CENTRAL_DIRECTORY_HEADER = 0x02014b50
const ZIP_END_OF_CENTRAL_DIRECTORY = 0x06054b50
const MAX_EOCD_SEARCH_BYTES = 65_557
const WATCH_HISTORY_PATH = /(^|\/)history\/watch-history\.json$/i
const YOUTUBE_PATH = /(^|\/)(youtube|youtube and youtube music)(\/|$)/i

export class YoutubeImportError extends Error {
  readonly code: YoutubeImportErrorCode

  constructor(code: YoutubeImportErrorCode, message: string) {
    super(message)
    this.name = "YoutubeImportError"
    this.code = code
  }
}

export const IMPORT_ERROR_GUIDANCE: Record<YoutubeImportErrorCode, ImportErrorGuidance> = {
  unsupported_format: {
    title: "This file type is not supported",
    message: "Choose Google Takeout's watch-history.json or the original Takeout ZIP archive.",
    action: "Use a .json or .zip file and keep the export unmodified.",
  },
  malformed_json: {
    title: "The history JSON is damaged",
    message: "The file could not be decoded as valid JSON.",
    action: "Download the Takeout export again, or choose the original ZIP so Playback Stats can locate the file.",
  },
  incorrect_takeout_path: {
    title: "YouTube watch history was not found",
    message: "This looks like a different export file, or the ZIP does not contain history/watch-history.json.",
    action: "In Takeout, include YouTube and YouTube Music → history, then import the new archive or watch-history.json.",
  },
  empty_history: {
    title: "No viewing records were found",
    message: "The selected history is empty or contains no supported YouTube viewing events.",
    action: "Check that watch history was enabled and that the export contains the dates you expect.",
  },
  memory_exhaustion: {
    title: "This export is too large to process safely",
    message: "The file or archive exceeds a local safety limit, or this browser ran out of memory.",
    action: "Create a smaller Takeout export, close other tabs, or use a desktop browser with more available memory.",
  },
  browser_failure: {
    title: "The browser could not read this export",
    message: "A local browser or storage operation failed before the dashboard was ready.",
    action: "Try again in an up-to-date browser. Your selected file was not uploaded.",
  },
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function containsYoutubeFields(record: Record<string, unknown>): boolean {
  return ["title", "titleUrl", "time", "subtitles", "header", "products"].some((key) => key in record)
}

export function parseYoutubeJson(text: string): ParsedYoutubeImport {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch (error) {
    if (error instanceof RangeError) {
      throw new YoutubeImportError("memory_exhaustion", "The browser ran out of memory while decoding the JSON.")
    }
    throw new YoutubeImportError("malformed_json", "The selected file is not valid JSON.")
  }

  let candidate: unknown[] | undefined
  if (Array.isArray(data)) {
    candidate = data
  } else if (isRecord(data)) {
    const possibleCollections = [data.items, data.watchHistory, data.videos]
    candidate = possibleCollections.find(Array.isArray)
    if (!candidate) {
      throw new YoutubeImportError(
        "incorrect_takeout_path",
        "The selected JSON does not contain a supported YouTube watch-history collection.",
      )
    }
  } else {
    throw new YoutubeImportError("unsupported_format", "The selected JSON has an unsupported root value.")
  }

  const records = candidate.filter(isRecord)
  if (records.length === 0 || !records.some(containsYoutubeFields)) {
    throw new YoutubeImportError("empty_history", "No supported YouTube viewing records were found.")
  }

  return { records, inputFormat: "youtube_json" }
}

function findEndOfCentralDirectory(bytes: Uint8Array): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const firstOffset = Math.max(0, bytes.length - MAX_EOCD_SEARCH_BYTES)
  for (let offset = bytes.length - 22; offset >= firstOffset; offset -= 1) {
    if (view.getUint32(offset, true) !== ZIP_END_OF_CENTRAL_DIRECTORY) continue
    const commentLength = view.getUint16(offset + 20, true)
    if (offset + 22 + commentLength === bytes.length) return offset
  }
  throw new YoutubeImportError("unsupported_format", "The selected archive is not a supported ZIP file.")
}

export function inspectTakeoutZip(bytes: Uint8Array): ZipEntry[] {
  if (bytes.byteLength > YOUTUBE_IMPORT_LIMITS.archiveBytes) {
    throw new YoutubeImportError("memory_exhaustion", "The ZIP archive exceeds the 100 MB compressed-size limit.")
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const eocdOffset = findEndOfCentralDirectory(bytes)
  const diskNumber = view.getUint16(eocdOffset + 4, true)
  const centralDirectoryDisk = view.getUint16(eocdOffset + 6, true)
  const entriesOnDisk = view.getUint16(eocdOffset + 8, true)
  const entryCount = view.getUint16(eocdOffset + 10, true)
  const centralDirectorySize = view.getUint32(eocdOffset + 12, true)
  const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true)

  if (
    diskNumber !== 0 ||
    centralDirectoryDisk !== 0 ||
    entriesOnDisk !== entryCount ||
    entryCount === 0xffff ||
    centralDirectorySize === 0xffffffff ||
    centralDirectoryOffset === 0xffffffff
  ) {
    throw new YoutubeImportError("unsupported_format", "Multi-disk and ZIP64 archives are not supported.")
  }
  if (entryCount > YOUTUBE_IMPORT_LIMITS.fileCount) {
    throw new YoutubeImportError("memory_exhaustion", "The ZIP archive contains too many files.")
  }
  if (centralDirectoryOffset + centralDirectorySize > bytes.length) {
    throw new YoutubeImportError("unsupported_format", "The ZIP central directory is incomplete.")
  }

  const decoder = new TextDecoder("utf-8", { fatal: false })
  const entries: ZipEntry[] = []
  let totalUncompressedBytes = 0
  let offset = centralDirectoryOffset

  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > bytes.length || view.getUint32(offset, true) !== ZIP_CENTRAL_DIRECTORY_HEADER) {
      throw new YoutubeImportError("unsupported_format", "The ZIP central directory contains an invalid entry.")
    }

    const flags = view.getUint16(offset + 8, true)
    const compressionMethod = view.getUint16(offset + 10, true)
    const compressedSize = view.getUint32(offset + 20, true)
    const uncompressedSize = view.getUint32(offset + 24, true)
    const fileNameLength = view.getUint16(offset + 28, true)
    const extraFieldLength = view.getUint16(offset + 30, true)
    const commentLength = view.getUint16(offset + 32, true)
    const localHeaderOffset = view.getUint32(offset + 42, true)
    const entryEnd = offset + 46 + fileNameLength + extraFieldLength + commentLength

    if (entryEnd > bytes.length || compressedSize === 0xffffffff || uncompressedSize === 0xffffffff) {
      throw new YoutubeImportError("unsupported_format", "The ZIP contains an unsupported ZIP64 or truncated entry.")
    }
    if (uncompressedSize > YOUTUBE_IMPORT_LIMITS.entryBytes) {
      throw new YoutubeImportError("memory_exhaustion", "A file inside the ZIP exceeds the 100 MB limit.")
    }

    totalUncompressedBytes += uncompressedSize
    if (totalUncompressedBytes > YOUTUBE_IMPORT_LIMITS.totalUncompressedBytes) {
      throw new YoutubeImportError("memory_exhaustion", "The ZIP expands beyond the 250 MB total limit.")
    }

    const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + fileNameLength)).replaceAll("\\", "/")
    entries.push({ name, flags, compressionMethod, compressedSize, uncompressedSize, localHeaderOffset })
    offset = entryEnd
  }

  return entries
}

function selectWatchHistoryEntry(entries: ZipEntry[]): ZipEntry {
  const pathMatches = entries.filter((entry) => WATCH_HISTORY_PATH.test(entry.name))
  const youtubeMatches = pathMatches.filter((entry) => YOUTUBE_PATH.test(entry.name))
  const candidates = youtubeMatches.length > 0 ? youtubeMatches : pathMatches

  if (candidates.length !== 1) {
    throw new YoutubeImportError(
      "incorrect_takeout_path",
      candidates.length === 0
        ? "The archive does not contain history/watch-history.json."
        : "The archive contains multiple possible watch-history.json files.",
    )
  }
  return candidates[0]
}

async function extractZipEntry(bytes: Uint8Array, entry: ZipEntry): Promise<Uint8Array> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const offset = entry.localHeaderOffset
  if (offset + 30 > bytes.length || view.getUint32(offset, true) !== ZIP_LOCAL_FILE_HEADER) {
    throw new YoutubeImportError("unsupported_format", "The ZIP contains an invalid local file header.")
  }
  const localFlags = view.getUint16(offset + 6, true)
  const localCompressionMethod = view.getUint16(offset + 8, true)
  if ((entry.flags & 0x1) !== 0 || (localFlags & 0x1) !== 0) {
    throw new YoutubeImportError("unsupported_format", "Encrypted ZIP entries are not supported.")
  }
  if (localCompressionMethod !== entry.compressionMethod) {
    throw new YoutubeImportError("unsupported_format", "The ZIP entry headers disagree on the compression method.")
  }

  const fileNameLength = view.getUint16(offset + 26, true)
  const extraFieldLength = view.getUint16(offset + 28, true)
  const dataOffset = offset + 30 + fileNameLength + extraFieldLength
  const dataEnd = dataOffset + entry.compressedSize
  if (dataEnd > bytes.length) {
    throw new YoutubeImportError("unsupported_format", "The ZIP entry is truncated.")
  }

  const compressed = bytes.subarray(dataOffset, dataEnd)
  if (entry.compressionMethod === 0) return compressed.slice()
  if (entry.compressionMethod !== 8) {
    throw new YoutubeImportError("unsupported_format", "The ZIP uses an unsupported compression method.")
  }

  return new Promise<Uint8Array>((resolve, reject) => {
    inflate(compressed, { size: entry.uncompressedSize }, (error, output) => {
      if (error) {
        reject(new YoutubeImportError("unsupported_format", "The watch-history.json ZIP entry could not be decompressed."))
        return
      }
      resolve(output)
    })
  }).catch((error) => {
    if (error instanceof YoutubeImportError) throw error
    if (error instanceof RangeError) {
      throw new YoutubeImportError("memory_exhaustion", "The browser ran out of memory while expanding the ZIP.")
    }
    throw new YoutubeImportError("unsupported_format", "The watch-history.json ZIP entry could not be decompressed.")
  })
}

export async function extractWatchHistoryJsonFromZip(bytes: Uint8Array): Promise<string> {
  const entries = inspectTakeoutZip(bytes)
  const entry = selectWatchHistoryEntry(entries)
  const jsonBytes = await extractZipEntry(bytes, entry)
  if (jsonBytes.byteLength !== entry.uncompressedSize) {
    throw new YoutubeImportError("unsupported_format", "The extracted watch-history.json size did not match the archive.")
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(jsonBytes)
  } catch (error) {
    if (error instanceof RangeError) {
      throw new YoutubeImportError("memory_exhaustion", "The browser ran out of memory while decoding the ZIP entry.")
    }
    throw new YoutubeImportError("malformed_json", "The watch-history.json entry is not valid UTF-8 text.")
  }
}

export function getYoutubeInputFormat(file: Pick<File, "name" | "type">): YoutubeInputFormat {
  const lowerName = file.name.toLowerCase()
  if (lowerName.endsWith(".zip")) return "takeout_zip"
  if (lowerName.endsWith(".json")) return "youtube_json"
  if (file.type === "application/zip" || file.type === "application/x-zip-compressed") return "takeout_zip"
  if (file.type === "application/json") return "youtube_json"
  throw new YoutubeImportError("unsupported_format", "Choose a JSON file or ZIP archive.")
}

export async function readYoutubeHistoryFile(file: File): Promise<ParsedYoutubeImport> {
  const inputFormat = getYoutubeInputFormat(file)
  const maximumBytes = inputFormat === "takeout_zip"
    ? YOUTUBE_IMPORT_LIMITS.archiveBytes
    : YOUTUBE_IMPORT_LIMITS.jsonBytes
  if (file.size > maximumBytes) {
    throw new YoutubeImportError("memory_exhaustion", "The selected file exceeds the 100 MB limit.")
  }

  try {
    if (inputFormat === "takeout_zip") {
      const json = await extractWatchHistoryJsonFromZip(new Uint8Array(await file.arrayBuffer()))
      return { ...parseYoutubeJson(json), inputFormat }
    }
    return parseYoutubeJson(await file.text())
  } catch (error) {
    if (error instanceof YoutubeImportError) throw error
    if (error instanceof RangeError) {
      throw new YoutubeImportError("memory_exhaustion", "The browser ran out of memory while processing the export.")
    }
    throw new YoutubeImportError("browser_failure", "The browser could not read the selected file.")
  }
}

export function asYoutubeImportError(error: unknown): YoutubeImportError {
  if (error instanceof YoutubeImportError) return error
  if (error instanceof RangeError) {
    return new YoutubeImportError("memory_exhaustion", "The browser ran out of memory while processing the export.")
  }
  return new YoutubeImportError("browser_failure", "An unexpected browser error interrupted processing.")
}
