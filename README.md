# Manuscript Submit Assistant

A Chrome extension that uses an **agentic extraction pipeline** to identify pertinent metadata from scientific manuscripts and automate journal submission workflows.

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
- Identifies the target journal from the page URL/title using the **Journal Octree**
- Shows a floating autofill panel with detected form fields
- Fills title, abstract, keywords, author name, email, and affiliation fields

### 5. Journal Octree Matching
The extension uses a hierarchical **Journal Octree** to:

- **Extract journal hints** from manuscript LaTeX (document class, bibliography style, `\journalname{}`)
- **Match manuscripts to relevant journals** based on keywords, abstract topics, and content analysis
- **Show submission field requirements** per journal (required vs optional, abstract word limits)
- **Identify journals** when you navigate to a submission page
- **Suggest ranked journals** in the Submit tab with match scores and readiness status

## Installation

### Load as Unpacked Extension (Development)

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the `extension/` directory

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

### Step 5: Submit to a Journal
1. Switch to the **Submit** tab
2. Review suggested journals ranked by relevance to your manuscript
3. Select a target journal to see its required submission fields and readiness status
4. Click **Open Submission Page** to navigate to the journal's portal
5. Use **Show Autofill Panel** or **Autofill Current Page** to fill form fields

### Step 6: Autofill Submission Form (on submission page)
1. Navigate to your journal's submission page
2. The floating panel detects the submission system and journal
3. Click **Fill Detected Fields** or **Fill All Fields**

## Project Structure

```
extension/
├── manifest.json           # Chrome extension manifest (MV3)
├── background/
│   └── service-worker.js   # Background message handler
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
│   ├── parser.js           # File parsing (tex, txt, docx, pdf)
│   ├── extractor.js        # Agentic metadata extraction
│   ├── abstract.js         # Abstract shortening strategies
│   ├── latex-formatter.js  # Journal LaTeX templates
│   ├── octree.js           # Journal taxonomy, matching, and field schemas
│   ├── autofill-mappings.js# Submission system field maps
│   └── storage.js          # Chrome storage helpers
├── icons/                  # Extension icons
└── samples/
    └── sample-manuscript.tex
```

## Privacy

- All manuscript parsing runs **locally in your browser**
- API keys are stored in Chrome sync storage and only sent to your chosen provider
- No data is sent to any server unless you configure an AI API key

## License

MIT License — see [LICENSE](LICENSE)
