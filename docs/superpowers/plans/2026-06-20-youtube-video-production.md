# YouTube Video Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce verified vertical and horizontal English tutorial videos that demonstrate Roblox GUI Maker on the live production site.

**Architecture:** A deterministic Playwright script records the real editor at 1920x1080 in timed scenes. Local narration, original synthesized music, HTML motion cards, and phrase-level captions are composed with FFmpeg into separate horizontal and vertically reframed H.264/AAC deliverables outside the repository.

**Tech Stack:** Playwright, macOS `say`, FFmpeg/FFprobe, HTML/CSS motion cards, Node.js

---

## File Structure

All media files live under `/Volumes/RTL9210/workspace/claude-projects/roblox-gui-maker-video-output/`:

- `source/voiceover.txt`: approved narration with speech pauses.
- `source/captions.srt`: phrase-level English captions.
- `source/capture.mjs`: deterministic production-site recording script.
- `source/cards.html`: Studio guide, CTA, and thumbnail artwork.
- `source/editor-master.webm`: raw real-site browser capture.
- `source/voiceover.wav`: normalized narration.
- `source/music.wav`: locally synthesized original background bed.
- `source/click.wav`: locally synthesized click accent.
- `source/studio-guide.png`, `source/end-card.png`: authored cards.
- `source/thumbnail.png`: source thumbnail render.
- `render-horizontal.sh`: horizontal FFmpeg composition.
- `render-short.sh`: vertical FFmpeg composition with segment-specific crops.
- `roblox-gui-maker-youtube.mp4`: 1920x1080 final video.
- `roblox-gui-maker-short.mp4`: 1080x1920 final video.
- `roblox-gui-maker-voiceover.wav`: delivered narration.
- `roblox-gui-maker-en.srt`: delivered captions.
- `roblox-gui-maker-thumbnail.png`: 1280x720 final thumbnail.
- `youtube-metadata.md`: upload copy.

### Task 1: Build The Timed Audio Foundation

**Files:**
- Create: `source/voiceover.txt`
- Create: `source/captions.srt`
- Create: `source/voiceover.wav`
- Create: `source/music.wav`
- Create: `source/click.wav`

- [x] **Step 1: Create the output directories**

Run:

```bash
mkdir -p /Volumes/RTL9210/workspace/claude-projects/roblox-gui-maker-video-output/source
```

Expected: the output and `source` directories exist outside the Git worktree.

- [x] **Step 2: Write the approved narration with explicit pauses**

Create `source/voiceover.txt` with the exact approved script. Insert `[[slnc 350]]` between sentences and `[[slnc 700]]` between storyboard sections so `say` produces visible editorial breathing room without changing wording.

- [x] **Step 3: Generate and normalize the English male narration**

Run:

```bash
say -v Daniel -r 162 -f source/voiceover.txt -o source/voiceover.aiff
ffmpeg -y -i source/voiceover.aiff -af "loudnorm=I=-16:TP=-1.5:LRA=7,aresample=48000" -ac 2 source/voiceover.wav
```

Expected: `ffprobe` reports 48 kHz stereo audio lasting 52-58 seconds. If it falls outside that range, change only the `say` rate until it fits, then regenerate.

- [x] **Step 4: Write phrase-level SRT captions**

Create `source/captions.srt` with caption blocks aligned to these sections: 00:00-00:05, 00:05-00:12, 00:12-00:20, 00:20-00:32, 00:32-00:44, 00:44-00:51, and 00:51 to the narration end. Split each section into readable phrases of at most two lines and 42 characters per line.

- [x] **Step 5: Generate original music and click audio**

Generate a 60-second low-level electronic bed from local oscillators and a 90 ms click:

```bash
ffmpeg -y -f lavfi -i "aevalsrc=0.035*sin(2*PI*110*t)*(0.55+0.45*lt(mod(t\,0.5)\,0.12))+0.018*sin(2*PI*220*t):s=48000:d=60" -af "afade=t=in:d=1,afade=t=out:st=57:d=3" -ac 2 source/music.wav
ffmpeg -y -f lavfi -i "sine=frequency=880:sample_rate=48000:duration=0.09" -af "afade=t=out:st=0.02:d=0.07,volume=0.22" -ac 2 source/click.wav
```

Expected: both files decode, contain no third-party sample, and remain below narration level.

- [x] **Step 6: Verify audio assets**

Run `ffprobe` for codec, sample rate, channels, and duration, then use FFmpeg `volumedetect` to confirm the narration does not clip and the music mean volume is at least 15 dB below narration.

### Task 2: Record The Real Production Editor

**Files:**
- Create: `source/capture.mjs`
- Create: `source/editor-master.webm`

- [x] **Step 1: Write the deterministic Playwright capture script**

The script must:

1. launch Chromium at 1920x1080 with video recording enabled;
2. visit `https://robloxguimaker.app/editor?template=main-menu`;
3. wait for `Client Luau code` and the Main Menu scene;
4. hold the loaded template for the load section;
5. click `[data-node-id="tpl-2"]`, fill the display value `GAME TITLE` with `CRYSTAL QUEST`, and pause;
6. click `[data-node-id="tpl-3"]`, fill the displayed background color `#00a2ff` with `#22c55e`, and pause;
7. click the `Preview` button, then `[data-node-id="tpl-5"]`, `[data-node-id="tpl-8"]`, and `[data-node-id="tpl-3"]` with visible pauses;
8. stop preview, focus `Client Luau code`, and scroll until `Activated:Connect` is visible;
9. assert there are no page console errors and save the closed context video as `source/editor-master.webm`.

Use `page.waitForTimeout` only for intentional on-screen holds; use locator assertions for readiness.

- [x] **Step 2: Run the capture**

Run from the repository so `playwright` resolves from local dependencies:

```bash
node /Volumes/RTL9210/workspace/claude-projects/roblox-gui-maker-video-output/source/capture.mjs
```

Expected: one 1920x1080 WebM lasting at least 40 seconds, with no console errors.

- [x] **Step 3: Inspect capture checkpoints**

Extract frames near 3, 10, 17, 27, and 39 seconds. Confirm the template, edit, preview panel, hidden menu transition, and Luau code are all visible and contain no private browser data or localhost UI.

### Task 3: Author Motion Cards And Thumbnail

**Files:**
- Create: `source/cards.html`
- Create: `source/studio-guide.png`
- Create: `source/end-card.png`
- Create: `source/thumbnail.png`

- [x] **Step 1: Build one self-contained HTML artboard file**

Create three 1920x1080 artboards using the website's dark background, electric blue, violet, Inter-like system typography, and `public/logo.png` encoded as a data URL:

- `#studio`: `STARTERGUI -> LOCALSCRIPT`, plus `Validate server-owned game logic in Studio`;
- `#end`: logo, `robloxguimaker.app`, `FREE`, `NO LOGIN`, `LINK IN DESCRIPTION`;
- `#thumbnail`: finished Main Menu screenshot, logo, and `ROBLOX GUI IN 60 SECONDS`.

- [x] **Step 2: Render the cards with Playwright**

Open each hash at 1920x1080 and save PNG screenshots. Render a second 1080x1920 version of Studio and end cards for the Shorts composition. Resize the thumbnail source to exactly 1280x720.

- [x] **Step 3: Inspect every card**

Confirm the URL is readable, the logo is not stretched, Studio wording matches the spec, and all text remains inside 10% title-safe margins.

### Task 4: Render The Horizontal Video

**Files:**
- Create: `render-horizontal.sh`
- Create: `roblox-gui-maker-youtube.mp4`

- [x] **Step 1: Write the horizontal FFmpeg composition**

Build a 1920x1080 timeline that trims and retimes the master capture into the approved seven sections, inserts the Studio and end cards, overlays short section headlines, burns `source/captions.srt`, and mixes narration with music plus click accents. Use `libx264`, `yuv420p`, AAC at 192 kbps, `-movflags +faststart`, and a final duration matching narration.

- [x] **Step 2: Render and probe the horizontal cut**

Run `bash render-horizontal.sh`. Expected: 1920x1080 H.264/AAC, 52-60 seconds, no decode errors, and the final URL visible for at least two seconds.

- [x] **Step 3: Extract and inspect horizontal proof frames**

Extract frames at 2, 9, 16, 26, 38, 47, and 55 seconds. Confirm each frame matches its storyboard section and captions do not cover the active control or code line.

### Task 5: Render The Vertical Shorts Video

**Files:**
- Create: `render-short.sh`
- Create: `roblox-gui-maker-short.mp4`

- [x] **Step 1: Write the segment-specific vertical composition**

Use the same timed content but create individual 1080x1920 segments:

- crop the center canvas for the opening and preview interaction;
- crop the hierarchy/properties side for customization;
- crop the Luau footer for export;
- use dedicated vertical Studio and CTA cards;
- place captions above the bottom 20% and left of the rightmost 12% Shorts action rail.

Do not apply one fixed crop to the whole master.

- [x] **Step 2: Render and probe the Shorts cut**

Run `bash render-short.sh`. Expected: 1080x1920 H.264/AAC, the same narration duration as horizontal, no decode errors, and no caption outside safe areas.

- [x] **Step 3: Extract and inspect vertical proof frames**

Extract the same seven timeline points. Confirm the focused element is readable on a phone-sized preview and the final URL remains visible for at least two seconds.

### Task 6: Package Upload Assets

**Files:**
- Create: `roblox-gui-maker-thumbnail.png`
- Create: `roblox-gui-maker-voiceover.wav`
- Create: `roblox-gui-maker-en.srt`
- Create: `youtube-metadata.md`

- [x] **Step 1: Copy final audio, caption, and thumbnail assets**

Copy the normalized narration, SRT, and 1280x720 thumbnail from `source/` into the output root with their delivery filenames.

- [x] **Step 2: Write upload metadata**

Use the title `Make a Roblox Main Menu GUI in 60 Seconds (Free, No Login)`. Include the HTTPS homepage and Main Menu template links, concise chapters, truthful feature copy, six relevant hashtags, the approved tag list, and a pinned comment pointing to the template.

- [x] **Step 3: Run final media verification**

Verify both MP4s with `ffprobe` and a full null decode, inspect audio loudness, generate contact sheets from seven proof frames per video, and confirm every required delivery file exists with a nonzero size.

- [x] **Step 4: Preserve repository scope**

Run `git status --short`. Expected: media output does not appear because it is outside the worktree; existing `.gitignore`, `.superpowers/`, and `docs/youtube-60s-script.md` remain untouched.

## Completion Evidence

- Final duration: 58.48 seconds for both cuts.
- Horizontal: H.264/AAC, 1920x1080, 25 fps, 48 kHz stereo, full null decode passed.
- Shorts: H.264/AAC, 1080x1920, 25 fps, 48 kHz stereo, full null decode passed.
- Audio: -19.4 dB mean and -3.5 dB peak in both final mixes.
- Captions: 18 timed blocks; longest line is 38 characters.
- Links: homepage, Main Menu template, templates, and guides returned HTTP 200 on 2026-06-20.
- Visual QA: seven-frame contact sheets inspected for each final cut.
- Repository scope: delivery media remains outside the Git worktree; pre-existing user changes remain untouched.
