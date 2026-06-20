# YouTube Video Production Design

## Goal

Produce two polished English tutorial videos from the existing 60-second concept: a vertical YouTube Shorts cut and a horizontal YouTube cut. Both videos must demonstrate the real production website, make truthful product claims, and end with a clear visit-the-site call to action.

## Deliverables

Write final media outside the Git repository to:

`/Volumes/RTL9210/workspace/claude-projects/roblox-gui-maker-video-output/`

The folder contains:

- `roblox-gui-maker-short.mp4` at 1080x1920;
- `roblox-gui-maker-youtube.mp4` at 1920x1080;
- `roblox-gui-maker-voiceover.wav`;
- `roblox-gui-maker-en.srt`;
- `roblox-gui-maker-thumbnail.png` at 1280x720;
- `youtube-metadata.md` with title, description, tags, chapters, and pinned comment;
- intermediate captures under `source/` for reproducibility.

The original `docs/youtube-60s-script.md` remains unchanged because it is user-owned working material.

## Production Approach

Use a hybrid of real browser capture and restrained motion graphics:

- all editor interactions are captured from `https://robloxguimaker.app`;
- the opening payoff, Studio placement instruction, and closing call to action use authored graphic cards;
- the Shorts and horizontal versions share narration and source actions but receive separate framing and caption placement;
- the vertical version uses intentional focus crops and motion framing, not a fixed center crop of the horizontal export;
- no Roblox Studio footage is fabricated because Roblox Studio is not installed locally.

## Timeline

### 0:00-0:05 - Payoff First

Show the completed Main Menu template in preview mode. Open Settings, close it, and display the headline `WORKING ROBLOX MENU`.

### 0:05-0:12 - Load The Template

Show the production URL and load `/editor?template=main-menu`. Establish the real hierarchy and the Title, Play, Settings, and Quit controls.

### 0:12-0:20 - Customize

Select the title and change its text to `CRYSTAL QUEST`. Select the Play button and change its color. Frame the properties panel closely enough that the edits are readable.

### 0:20-0:32 - Preview Interactions

Enter Preview mode. Click Settings to reveal its panel, click Close to hide it, and click Play to hide the menu. Use short callouts rather than extra narration to identify each action.

### 0:32-0:44 - Export Luau

Open the client Luau output. Highlight generated Roblox instances and `Activated:Connect` visibility handlers. Do not imply that the editor generates secure economy, purchase, reward, or datastore logic.

### 0:44-0:51 - Studio Placement Guide

Use a motion card reading `StarterGui -> LocalScript` and explain that server-owned game logic must still be validated in Studio. This replaces the optional Studio footage in the original draft.

### 0:51-0:58 - Call To Action

Show the logo, `robloxguimaker.app`, `FREE`, `NO LOGIN`, and `LINK IN DESCRIPTION`. Leave the final URL visible for at least two seconds.

## Final Voiceover

Use this exact English narration, with natural pauses between paragraphs:

> Here is a working Roblox main menu, built in under a minute. No Studio setup, no login.
>
> Open robloxguimaker dot app and load the Main Menu template. You get a title, Play, Settings, and Quit, already stacked.
>
> Select any element to change the text, color, font, or size using real Roblox properties.
>
> Now hit Preview. Settings opens the panel. Close hides it. Play hides the whole menu. The buttons actually work.
>
> Open the Luau export. It generates the Roblox instances, responsive layout, and Activated click handlers for you.
>
> Put the client script in a LocalScript under StarterGui, then connect any server-owned game logic safely in Studio.
>
> It is free, needs no account, and saves in your browser. Try it at robloxguimaker dot app. Link in the description.

## Audio

- Narration uses a clear, neutral English male voice at a brisk but intelligible tutorial pace.
- Background music is an original, subtle electronic pulse generated locally; it contains no copyrighted sample or third-party track.
- Music remains well below narration and fades under the Studio guide and final URL.
- Click accents are synthetic and quiet enough not to compete with speech.
- The final mix must avoid clipping and keep narration consistently intelligible on phone speakers.

## Captions

- Burn English captions into both videos and also deliver the same timing as SRT.
- Use short phrase-level captions rather than full paragraph blocks.
- White text sits on a translucent dark rounded background; product keywords use the existing electric blue accent.
- Shorts captions remain above the lower platform controls and away from the right-side action rail.
- Horizontal captions remain inside title-safe margins and do not cover the properties panel or generated code being discussed.

## Visual System

- Use the site's dark background, electric blue primary accent, violet secondary accent, and existing logo.
- Motion is limited to quick ease-in crops, cursor emphasis, short highlight boxes, and clean card transitions.
- Avoid unrelated stock footage, Roblox gameplay clips, excessive particles, or generic gaming imagery.
- The thumbnail uses the finished menu on the left and the text `ROBLOX GUI IN 60 SECONDS` on the right, with the website accent colors and logo.

## Truthfulness And Safety

- Record only the live production site and locally authored graphics.
- Do not claim that Roblox Studio is unnecessary for shipping a game; only the initial visual build requires no Studio setup.
- Do not claim the generated client script provides secure server logic.
- Do not display credentials, private browser data, local development URLs, or unrelated tabs.
- Links and metadata use `https://robloxguimaker.app` and the Main Menu template URL.

## Verification

Before delivery:

- verify both MP4 files decode with FFmpeg;
- verify exact dimensions, H.264 video, AAC audio, and duration between 52 and 60 seconds;
- inspect the first, middle, and final frames of each cut;
- confirm narration is audible and synchronized with the demonstrated action;
- confirm captions remain within safe areas in both aspect ratios;
- confirm the production URL and call to action remain readable;
- confirm the horizontal and vertical edits contain no blank frames, browser errors, or local-only UI;
- review the metadata for truthful claims and working HTTPS links.

## Non-Goals

- Installing or recording Roblox Studio.
- Uploading or publishing the video to the user's YouTube account.
- Using copyrighted music, third-party gameplay, or creator footage.
- Producing localized Chinese narration in this version.
- Replacing the user's original draft script.
