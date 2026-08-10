# Manuscript Submit Assistant

A cross-browser WebExtension (Chrome and Firefox) that uses an **agentic extraction pipeline** to identify pertinent metadata from scientific manuscripts and automate journal submission workflows.

## Features

### 1. Agentic Metadata Extraction
Upload a manuscript (`.tex`, `.txt`, `.docx`, or `.pdf`) and the extension automatically extracts:

- **Title** — from LaTeX `\title{}` or document structure
- **Author names** — from `\author{}` blocks or name-pattern heuristics
- **Affiliations** — from `\affiliation{}`, `\institute{}`, or institution keywords
- **Email addresses** — regex detection across the document
- **Abstract** — from LaTeX `abstract` environment or section headings
- **Keywords** — from `\keywords{}` or keyword sections

The agent runs multiple passes:
1. **Structure analysis** — LaTeX commands and section hierarchy
2. **Heuristic detection** — pattern matching with confidence scores
3. **Validation** — cross-field consistency checks
4. **LLM enhancement** (optional) — AI refinement via OpenAI or Anthropic API

### 2. Abstract Word-Limit Management
When an abstract exceeds the configured word limit (default: 250 words), the extension offers:

- **Condense** — remove filler phrases and redundant wording
- **Smart trim** — remove lower-priority sentences by importance scoring
- **Hard truncate** — cut to word limit at sentence boundary
- **AI shorten** — LLM-powered concise rewrite (requires API key)

### 3. LaTeX Journal Formatting
Apply minor LaTeX source transformations for target journals:

| Journal | Document Class | Key Changes |
|---------|---------------|-------------|
| Elsevier | `elsarticle` | Line numbers, review mode |
| Springer | `svjour3` | Bibliography style |
| IEEE | `IEEEtran` | Author block format |
| Nature | `article` + natbib | 12pt, naturemag bib style |
| ACM | `acmart` | CCS concepts, ACM bib |
| PLOS | `article` | plos2015 bib style |
| Wiley | `WileyNJDv5` | Wiley author format |

### 4. Journal Submission Autofill
On journal submission pages, the extension:

- Detects the submission system (Elsevier Editorial Manager, Wiley ScholarOne, Springer Nature, etc.)
- Shows a floating autofill panel with detected form fields
- Fills title, abstract, keywords, author name, email, and affiliation fields

## Installation

The same `extension/` folder works in both Chrome and Firefox. No separate build step is required.

### Chrome

1. Clone this repository
2. Open `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the `extension/` directory

### Firefox

Requires **Firefox 121+** (Manifest V3 with ES module background scripts).

**Temporary add-on (development):**

1. Clone this repository
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on…**
4. Select `extension/manifest.json`

**Permanent install (unsigned / self-distributed):**

1. Build the `.xpi` package (see [Packaging for Firefox](#packaging-for-firefox) below)
2. Open `about:addons` → gear icon → **Install Add-on From File…**
3. Select the generated `.xpi` from `dist/`

> **Note:** Unsigned add-ons require `xpinstall.signatures.required` set to `false` in `about:config` (advanced users only). For public distribution, publish to [Firefox Add-ons (AMO)](https://addons.mozilla.org/).

For Firefox Add-ons (AMO) distribution, the manifest already includes `browser_specific_settings.gecko` with a fixed add-on ID.

### Packaging for Firefox

Build a distributable `.xpi` from the `extension/` folder:

```bash
# Option 1: npm script (uses zip)
npm run package:firefox

# Option 2: shell script directly
bash scripts/package-firefox.sh

# Option 3: Node.js wrapper
npm run package:firefox:node
```

Output: `dist/manuscript-submit-assistant-<version>.xpi`

The archive contains `manifest.json` at the root, as Firefox requires. Install via `about:addons` → **Install Add-on From File…`.

### Browser compatibility

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Metadata extraction | Yes | Yes |
| Abstract shortening | Yes | Yes |
| LaTeX formatting | Yes | Yes |
| Submission autofill | Yes | Yes |
| AI enhancement (API) | Yes | Yes |
| Background handler | Service worker | Event page (scripts) |

The extension uses the standard WebExtension `browser`/`chrome` API via a small polyfill (`lib/browser-api.js`). Chrome loads `background/service-worker.js`; Firefox loads `background/event-page.js`. Both share the same logic in `background/message-handler.js`.

### Configure Settings

1. Click the extension icon → gear icon (⚙️), or right-click → Options
2. Set your abstract word limit (default: 250)
3. Optionally configure an OpenAI or Anthropic API key for AI features

## Usage

### Step 1: Upload Manuscript
1. Click the extension icon
2. Drag and drop your manuscript or click to browse
3. Supported formats: `.tex`, `.txt`, `.docx`, `.pdf`

### Step 2: Review Extracted Fields
1. Switch to the **Extract** tab
2. Review and edit title, authors, affiliations, emails, keywords, and abstract
3. Click **Save Changes** or **Copy All**

### Step 3: Manage Abstract Length
1. Switch to the **Abstract** tab
2. If over the word limit, preview shortening options
3. Select an option and click **Apply Selected**

### Step 4: Format LaTeX (optional)
1. Switch to the **LaTeX** tab (requires `.tex` upload)
2. Select target journal
3. Click **Apply Journal Format**
4. Copy or download the formatted `.tex` file

### Step 5: Autofill Submission Form
1. Navigate to your journal's submission page
2. Switch to the **Submit** tab
3. Click **Show Autofill Panel on Page** or **Autofill Current Page**

## Project Structure

```
extension/
├── manifest.json           # WebExtension manifest (MV3, Chrome + Firefox)
scripts/
├── package-firefox.sh      # Build Firefox .xpi (bash + zip)
└── package-firefox.mjs     # Build Firefox .xpi (Node wrapper)
dist/                       # Generated .xpi packages (gitignored)
├── background/
│   ├── service-worker.js   # Chrome background entry
│   ├── event-page.js       # Firefox background entry
│   └── message-handler.js  # Shared message handling logic
├── content/
│   ├── autofill.js         # Page autofill content script
│   └── autofill.css        # Floating panel styles
├── popup/
│   ├── popup.html          # Main extension popup UI
│   ├── popup.css
│   └── popup.js
├── options/
│   ├── options.html        # Settings page
│   ├── options.css
│   └── options.js
├── lib/
│   ├── browser-api.js      # Chrome/Firefox API polyfill
│   ├── parser.js           # File parsing (tex, txt, docx, pdf)
│   ├── extractor.js        # Agentic metadata extraction
│   ├── abstract.js         # Abstract shortening strategies
│   ├── latex-formatter.js  # Journal LaTeX templates
│   ├── autofill-mappings.js# Submission system field maps
│   └── storage.js          # Cross-browser storage helpers
├── icons/                  # Extension icons
└── samples/
    └── sample-manuscript.tex
```

## Privacy

- All manuscript parsing runs **locally in your browser**
- API keys are stored in browser sync storage and only sent to your chosen provider
- No data is sent to any server unless you configure an AI API key

## License

MIT License — see [LICENSE](LICENSE)
