// Resume text extraction + best-effort field detection.
//
// PDF parsing (pdfjs-dist) and DOCX parsing (mammoth) are dynamically imported
// so the ~1.5MB of parser code only loads when the user picks a resume file —
// nobody who just browses the site pays the bundle cost.

export interface ExtractedFields {
  name?: string
  email?: string
  portfolio?: string
}

async function extractFromPdf(file: File): Promise<string> {
  const pdfjs: any = await import('pdfjs-dist')
  // pdf.js needs a worker; bundle it via Vite's ?url import so it ships
  // alongside our app instead of CDN-fetching at runtime.
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const buffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buffer }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map((it: any) => it.str).join(' '))
  }
  return pages.join('\n')
}

async function extractFromDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth')
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value || ''
}

export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase()
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
    return extractFromPdf(file)
  }
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return extractFromDocx(file)
  }
  // .doc (legacy binary Word) is not supported client-side without a heavy lib;
  // just bail and let the user fill the form manually.
  return ''
}

// --- Field detection -----------------------------------------------------

const EMAIL_RE = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i

const PORTFOLIO_DOMAINS = [
  'github.com',
  'gitlab.com',
  'behance.net',
  'dribbble.com',
  'artstation.com',
  'vimeo.com',
  'youtube.com',
  'youtu.be',
  'itch.io',
  'soundcloud.com',
  'linkedin.com',
  'notion.site',
  'notion.so',
]

const NAME_NOISE = [
  /^resume$/i,
  /^curriculum\s*vitae$/i,
  /^cv$/i,
  /^profile$/i,
  /\b(phone|email|address|github|linkedin|portfolio|mobile|tel|@)\b/i,
  /^\d/, // starts with a number — probably a phone/date, not a name
]

function isLikelyName(line: string): boolean {
  const trimmed = line.trim()
  if (trimmed.length < 3 || trimmed.length > 60) return false
  if (NAME_NOISE.some((re) => re.test(trimmed))) return false
  // Expect 2–4 capitalized words made of letters / hyphens / apostrophes.
  const words = trimmed.split(/\s+/)
  if (words.length < 2 || words.length > 4) return false
  return words.every((w) => /^[A-Z][A-Za-z'’-]+$/.test(w))
}

function extractName(text: string): string | undefined {
  // Names usually live in the first dozen or so non-empty lines.
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 15)
  return lines.find(isLikelyName)
}

function extractEmail(text: string): string | undefined {
  const match = text.match(EMAIL_RE)
  return match?.[0].toLowerCase()
}

function extractPortfolio(text: string): string | undefined {
  // Look for any http(s) URL whose host matches a known portfolio domain.
  const urlRe = /\bhttps?:\/\/[^\s<>"')]+/gi
  const urls = text.match(urlRe) ?? []
  // Strip trailing punctuation that often clings to URLs in resumes.
  const cleaned = urls.map((u) => u.replace(/[.,;:)\]]+$/, ''))
  return cleaned.find((u) => {
    try {
      const host = new URL(u).hostname.toLowerCase()
      return PORTFOLIO_DOMAINS.some((d) => host === d || host.endsWith('.' + d) || host.endsWith(d))
    } catch {
      return false
    }
  })
}

export function detectFields(text: string): ExtractedFields {
  if (!text) return {}
  return {
    name: extractName(text),
    email: extractEmail(text),
    portfolio: extractPortfolio(text),
  }
}

export async function extractFieldsFromFile(file: File): Promise<ExtractedFields> {
  try {
    const text = await extractText(file)
    return detectFields(text)
  } catch (err) {
    console.warn('Resume extraction failed:', err)
    return {}
  }
}
