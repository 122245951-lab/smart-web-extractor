# Smart Web Extractor

AI-powered browser extension to extract key content from web pages in 30 seconds.

## Installation
1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click Load unpacked
4. Select the `plugin/` folder

## First Use
1. Click the blue Extract edge tab on the right
2. Configure AI service: choose DeepSeek or Tongyi Qianwen, enter API Key
3. Click Start Extract, plugin generates structured summary

## Features
- Content Extraction: auto-detect, preserve headings, <500ms
- Image Extraction: grid thumbnails, batch ZIP download
- Table Extraction: HTML/div detection, CSV export
- Ad Filter: silent + preview dual mode
- AI Summary: DeepSeek / Tongyi Qianwen, 3 templates
- Multi-format Export: TXT / Markdown / Word

## Privacy
- AES-GCM-256 encrypted API Key storage
- Runs entirely in browser, no third-party servers
- Data only sent to user-configured AI provider via HTTPS

## Keyboard
Ctrl+Shift+E: Toggle panel, Escape: Close panel, Ctrl+Enter: Send AI chat
