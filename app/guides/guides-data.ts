// Written how-to guides. Each targets a tutorial-intent query that currently
// lands on YouTube ("how to make a roblox shop gui", etc.) and pairs with a
// template you can open in the editor. SSG'd at /guides/<slug>.

export type GuideSection = {
  heading: string;
  paragraphs?: string[];
  code?: string;
  tip?: string;
};

export type Faq = { q: string; a: string };

export type Guide = {
  slug: string;
  title: string;
  description: string;
  category: string;
  relatedTemplate?: string;
  intro: string;
  sections: GuideSection[];
  faq: Faq[];
};

export const GUIDES: Guide[] = [
  {
    slug: "how-to-make-a-roblox-main-menu-gui",
    title: "How to Make a Roblox Main Menu GUI",
    description:
      "Step by step: build a Roblox main menu GUI with a ScreenGui, centered panel, title and stacked Play/Settings buttons using UIListLayout, plus the Luau to handle button clicks.",
    category: "Menus",
    relatedTemplate: "main-menu",
    intro:
      "The main menu is the first thing players see when they join your game. This guide builds one from scratch in Luau — a ScreenGui container, a centered panel, a title, and Play / Settings buttons stacked automatically with a UIListLayout. You can also start from the ready-made main-menu template in the editor and customize it.",
    sections: [
      {
        heading: "1. Create the ScreenGui container",
        paragraphs: [
          "Every on-screen interface lives inside a ScreenGui. Put it in the local player's PlayerGui so it renders on their screen, and set ResetOnSpawn to false so the menu survives respawns.",
        ],
        code: `local player = game:GetService("Players").LocalPlayer
local gui = Instance.new("ScreenGui")
gui.Name = "MainMenu"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = player:WaitForChild("PlayerGui")`,
      },
      {
        heading: "2. Add a centered panel and title",
        paragraphs: [
          "A Frame acts as the menu background, a UICorner rounds it, and a TextLabel shows the game title. AnchorPoint 0.5,0.5 plus Position 0.5,0.5 centers the panel exactly on screen.",
        ],
        code: `local panel = Instance.new("Frame")
panel.Size = UDim2.fromScale(0.4, 0.6)
panel.Position = UDim2.fromScale(0.5, 0.5)
panel.AnchorPoint = Vector2.new(0.5, 0.5)
panel.BackgroundColor3 = Color3.fromRGB(21, 23, 31)
panel.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 18)
corner.Parent = panel

local title = Instance.new("TextLabel")
title.Size = UDim2.fromScale(1, 0.18)
title.BackgroundTransparency = 1
title.Text = "GAME TITLE"
title.Font = Enum.Font.GothamBlack
title.TextSize = 30
title.TextColor3 = Color3.fromRGB(153, 203, 255)
title.Parent = panel`,
      },
      {
        heading: "3. Stack the buttons with UIListLayout",
        paragraphs: [
          "Drop a UIListLayout into the panel and every child you add afterwards stacks itself — no manual positioning. Set Padding for spacing and HorizontalAlignment to center them.",
        ],
        code: `local layout = Instance.new("UIListLayout")
layout.Padding = UDim.new(0, 10)
layout.HorizontalAlignment = Enum.HorizontalAlignment.Center
layout.Parent = panel`,
      },
      {
        heading: "4. Make the buttons do something",
        paragraphs: [
          "Each button is a TextButton. Connect MouseButton1Click to run code when the player taps it — here, PLAY hides the menu and starts the game.",
        ],
        code: `local playBtn = Instance.new("TextButton")
playBtn.Size = UDim2.fromScale(1, 0.14)
playBtn.Text = "PLAY"
playBtn.Font = Enum.Font.GothamBold
playBtn.TextSize = 20
playBtn.Parent = panel

playBtn.MouseButton1Click:Connect(function()
\tgui.Enabled = false
\t-- start the game here
end)`,
        tip: "Use gui.Enabled = false to hide the menu and keep it around, or gui:Destroy() if you'll never show it again.",
      },
    ],
    faq: [
      {
        q: "How do I center the menu on screen?",
        a: "Set the panel's AnchorPoint to Vector2.new(0.5, 0.5) and Position to UDim2.fromScale(0.5, 0.5). The panel then centers on its own midpoint instead of its top-left corner.",
      },
      {
        q: "Why does my menu disappear when I respawn?",
        a: "By default a ScreenGui resets on spawn. Set ResetOnSpawn = false on the ScreenGui to keep it persistent.",
      },
    ],
  },
  {
    slug: "how-to-make-a-roblox-shop-gui",
    title: "How to Make a Roblox Shop GUI",
    description:
      "Build a Roblox shop GUI: a ScrollingFrame whose items auto-tile with UIGridLayout, item cells with images and prices, and a RemoteEvent so purchases actually work server-side.",
    category: "Shop",
    relatedTemplate: "shop",
    intro:
      "A shop needs three things: a scrollable area, items that tile into a grid, and a way for the purchase to actually happen. This guide builds the UI with a ScrollingFrame + UIGridLayout, then wires the buy action through a RemoteEvent so the server verifies it. Start from the shop template to skip the layout work.",
    sections: [
      {
        heading: "1. The panel and scrollable grid",
        paragraphs: [
          "A Frame holds everything; a ScrollingFrame is where items go. Adding a UIGridLayout to the ScrollingFrame makes every item cell tile automatically into a grid — add as many items as you want and they reflow.",
        ],
        code: `local panel = Instance.new("Frame")
panel.Size = UDim2.fromScale(0.6, 0.76)
panel.Position = UDim2.fromScale(0.2, 0.12)
panel.Parent = gui

local scroll = Instance.new("ScrollingFrame")
scroll.Size = UDim2.fromScale(1, 0.8)
scroll.BackgroundTransparency = 1
scroll.ScrollBarThickness = 6
scroll.Parent = panel

local grid = Instance.new("UIGridLayout")
grid.CellSize = UDim2.fromOffset(120, 120)
grid.CellPadding = UDim2.fromOffset(10, 10)
grid.Parent = scroll`,
      },
      {
        heading: "2. An item cell",
        paragraphs: [
          "Each item is a Frame with an ImageLabel, a price label, and a buy button. Because of the UIGridLayout, just parenting it to the ScrollingFrame places it in the grid.",
        ],
        code: `local function makeItem(name, price, imageId)
\tlocal cell = Instance.new("TextButton")
\tcell.Text = ""
\tcell.BackgroundColor3 = Color3.fromRGB(40, 41, 51)
\tcell.Parent = scroll

\tlocal icon = Instance.new("ImageLabel")
\ticon.Size = UDim2.fromScale(1, 0.7)
\ticon.BackgroundTransparency = 1
\ticon.Image = "rbxassetid://" .. imageId
\ticon.Parent = cell

\tlocal label = Instance.new("TextLabel")
\tlabel.Size = UDim2.fromScale(1, 0.3)
\tlabel.Position = UDim2.fromScale(0, 0.7)
\tlabel.BackgroundTransparency = 1
\tlabel.Text = name .. " - " .. price
\tlabel.Parent = cell

\treturn cell
end`,
      },
      {
        heading: "3. Wire the purchase through a RemoteEvent",
        paragraphs: [
          "Never trust the client with money. The buy button fires a RemoteEvent; the server checks the player can afford it, deducts currency, and grants the item.",
        ],
        code: `-- LocalScript (client)
buyRemote = game.ReplicatedStorage:WaitForChild("BuyItem")
cell.MouseButton1Click:Connect(function()
\tbuyRemote:FireServer(itemId)
end)

-- Script (server)
buyRemote.OnServerEvent:Connect(function(player, itemId)
\t-- verify currency, deduct, grant item
end)`,
        tip: "Always validate purchases on the server. A client can fire a RemoteEvent with any itemId, so the server must re-check price and ownership.",
      },
    ],
    faq: [
      {
        q: "How do I make the shop scroll smoothly?",
        a: "Use a ScrollingFrame with AutomaticCanvasSize = Enum.AutomaticSize.Y and a UISizeConstraint or the UIGridLayout's cells defining height. ScrollBarThickness controls the scrollbar width.",
      },
      {
        q: "How do items tile into a grid?",
        a: "Parent a UIGridLayout to the ScrollingFrame. Set CellSize and CellPadding; every child Frame then auto-positions into rows and columns.",
      },
    ],
  },
  {
    slug: "how-to-make-a-roblox-loading-screen-gui",
    title: "How to Make a Roblox Loading Screen GUI",
    description:
      "Make a Roblox loading screen: a full-screen frame with a gradient, title, an animated progress bar using TweenService, and a rotating tip — then remove it when the game is ready.",
    category: "Menus",
    relatedTemplate: "loading-screen",
    intro:
      "A loading screen covers the viewport while assets stream in. This guide builds a full-screen Frame with a gradient background, a big title, a progress bar whose fill tweens from 0 to full, and a tip line. Once your game is ready, you destroy the GUI. There's also a loading-screen template to start from.",
    sections: [
      {
        heading: "1. Full-screen background and title",
        paragraphs: [
          "Set IgnoreGuiInset = true on the ScreenGui so the frame covers the whole viewport including the top bar. A UIGradient on the background Frame gives it depth.",
        ],
        code: `local gui = Instance.new("ScreenGui")
gui.IgnoreGuiInset = true
gui.Parent = player.PlayerGui

local bg = Instance.new("Frame")
bg.Size = UDim2.fromScale(1, 1)
bg.BackgroundColor3 = Color3.fromRGB(12, 13, 23)
bg.Parent = gui

local title = Instance.new("TextLabel")
title.Size = UDim2.fromScale(0.6, 0.12)
title.Position = UDim2.fromScale(0.2, 0.36)
title.BackgroundTransparency = 1
title.Text = "LOADING"
title.Font = Enum.Font.GothamBlack
title.TextSize = 44
title.Parent = bg`,
      },
      {
        heading: "2. The progress bar",
        paragraphs: [
          "The bar is two Frames: a dark track and a colored fill. The fill starts at Scale 0 width and you tween it up as loading progresses.",
        ],
        code: `local track = Instance.new("Frame")
track.Size = UDim2.fromScale(0.4, 0.03)
track.Position = UDim2.fromScale(0.3, 0.56)
track.BackgroundColor3 = Color3.fromRGB(29, 31, 41)
track.Parent = bg
Instance.new("UICorner", track).CornerRadius = UDim.new(1, 0)

local fill = Instance.new("Frame")
fill.Size = UDim2.fromScale(0, 1)
fill.BackgroundColor3 = Color3.fromRGB(0, 162, 255)
fill.Parent = track
Instance.new("UICorner", fill).CornerRadius = UDim.new(1, 0)`,
      },
      {
        heading: "3. Animate it and clean up",
        paragraphs: [
          "Use TweenService to grow the fill. When loading is done, Destroy the GUI so it's gone for good.",
        ],
        code: `local tween = game:GetService("TweenService"):Create(
\tfill,
\tTweenInfo.new(3, Enum.EasingStyle.Linear),
\t{ Size = UDim2.fromScale(1, 1) }
)
tween:Play()
tween.Completed:Connect(function()
\tgui:Destroy()
end)`,
        tip: "For a real game, drive the fill from actual asset-loading progress rather than a fixed timer, so it never finishes before the game is ready.",
      },
    ],
    faq: [
      {
        q: "How do I cover the top bar too?",
        a: "Set IgnoreGuiInset = true on the ScreenGui. The first Frame with Size UDim2.fromScale(1,1) then covers the entire viewport.",
      },
      {
        q: "How do I animate the progress bar?",
        a: "Tween the fill Frame's Size from UDim2.fromScale(0,1) to UDim2.fromScale(1,1) with TweenService, then Destroy the GUI in tween.Completed.",
      },
    ],
  },
  {
    slug: "how-to-use-uilistlayout-in-roblox",
    title: "How to Use UIListLayout in Roblox",
    description:
      "UIListLayout auto-arranges a container's children into a row or column. Learn the key properties — FillDirection, Padding, alignment, SortOrder — with a working Luau example.",
    category: "Layouts",
    relatedTemplate: "settings",
    intro:
      "UIListLayout is the Roblox layout object that automatically stacks a Frame's children in a vertical list or horizontal row. Instead of positioning every button by hand, you drop one UIListLayout into a container and the children arrange themselves. This guide covers the properties that matter and a complete example.",
    sections: [
      {
        heading: "1. Add it to a container",
        paragraphs: [
          "UIListLayout is a child of the container it controls. The moment it's parented, every sibling Frame, button or label gets arranged.",
        ],
        code: `local layout = Instance.new("UIListLayout")
layout.Parent = containerFrame`,
      },
      {
        heading: "2. Direction, padding and alignment",
        paragraphs: [
          "FillDirection picks vertical or horizontal. Padding sets the gap between children. HorizontalAlignment and VerticalAlignment position the whole stack within the container.",
        ],
        code: `layout.FillDirection = Enum.FillDirection.Vertical
layout.Padding = UDim.new(0, 12)
layout.HorizontalAlignment = Enum.HorizontalAlignment.Center
layout.VerticalAlignment = Enum.VerticalAlignment.Top`,
      },
      {
        heading: "3. Control order with SortOrder",
        paragraphs: [
          "By default children sort by their layout order, then name. Set SortOrder to LayoutOrder and give each child a LayoutOrder number to control the exact sequence.",
        ],
        code: `layout.SortOrder = Enum.SortOrder.LayoutOrder
firstButton.LayoutOrder = 1
secondButton.LayoutOrder = 2`,
        tip: "Pair UIListLayout with a UIPadding on the same container to inset the whole stack from the edges — no per-child margins needed.",
      },
    ],
    faq: [
      {
        q: "Does UIListLayout work horizontally too?",
        a: "Yes — set FillDirection = Enum.FillDirection.Horizontal and the children arrange left to right (or right to left depending on alignment).",
      },
      {
        q: "Why aren't my children spacing apart?",
        a: "Set the layout's Padding to a UDim value like UDim.new(0, 10). Without it, children touch edge to edge.",
      },
    ],
  },
  {
    slug: "how-to-make-a-roblox-global-leaderboard-gui",
    title: "How to Make a Roblox Global Leaderboard GUI",
    description:
      "Build a global Roblox leaderboard that ranks all players across servers with OrderedDataStore, then displays the top entries in a GUI — with the full Luau for saving, sorting and showing rows.",
    category: "Data",
    relatedTemplate: "leaderboard",
    intro:
      "A global leaderboard ranks every player by a stat like total coins, and the ranking persists across servers. The hard part isn't the GUI — it's storing sorted data with OrderedDataStore and reading the top players back. This guide covers the full loop: save a score, fetch the top 10, and render them as rows. Start from the leaderboard template for the row layout.",
    sections: [
      {
        heading: "1. Store ranked data with OrderedDataStore",
        paragraphs: [
          "An OrderedDataStore keeps values sortable. Use the player's UserId as the key and their score as the value, so each player appears once.",
        ],
        code: `local DataStoreService = game:GetService("DataStoreService")
local scores = DataStoreService:GetOrderedDataStore("CoinsLeaderboard")

local function saveScore(player, coins)
\tscores:UpdateAsync(tostring(player.UserId), function(old)
\t\treturn math.max(old or 0, coins)
\tend)
end`,
      },
      {
        heading: "2. Read the top players",
        paragraphs: [
          "GetSortedAsync returns the entries in order. Pass false for descending (highest first) and a page size. GetCurrentPage gives the ranked list of { key, value }.",
        ],
        code: `local function getTop(n)
\tlocal page = scores:GetSortedAsync(false, n)
\tlocal entries = {}
\tfor _, entry in ipairs(page:GetCurrentPage()) do
\t\tlocal userId = tonumber(entry.key)
\t\tlocal player = game:GetService("Players"):GetNameFromUserIdAsync(userId)
\t\ttable.insert(entries, { name = player, score = entry.value })
\tend
\treturn entries
end`,
        tip: "GetNameFromUserIdAsync is a web call — cache names so you don't re-fetch the same player every refresh.",
      },
      {
        heading: "3. Send the list to clients and build rows",
        paragraphs: [
          "Fire a RemoteEvent with the top list; each client builds a row per entry. Because the panel has a UIListLayout, parenting each row stacks it automatically.",
        ],
        code: `-- Server
local remote = game.ReplicatedStorage:WaitForChild("LeaderboardUpdate")
task.spawn(function()
\twhile true do
\t\tremote:FireAllClients(getTop(10))
\t\ttask.wait(60) -- refresh once a minute
\tend
end)

-- Client: make one row per entry, parented to the panel
local function makeRow(rank, name, score)
\tlocal row = Instance.new("Frame")
\trow.Size = UDim2.fromScale(1, 0.14)
\trow.Parent = panel
\t-- ...rank label, name label, score label...
\treturn row
end`,
      },
    ],
    faq: [
      {
        q: "How often should I refresh a global leaderboard?",
        a: "OrderedDataStore has tight rate limits. Cache the top list and refresh every 30–60 seconds via a server loop, never on every score change.",
      },
      {
        q: "Why does a player appear twice?",
        a: "You're using something other than UserId as the key. Always key by tostring(player.UserId) so each player maps to exactly one entry.",
      },
    ],
  },
  {
    slug: "how-to-animate-roblox-guis-with-tweenservice",
    title: "How to Animate Roblox GUIs with TweenService",
    description:
      "Make Roblox GUIs feel polished: slide panels in from off-screen, fade and pop them, and chain animations — all with TweenService and the right EasingStyle.",
    category: "Animation",
    relatedTemplate: "main-menu",
    intro:
      "Static GUIs feel flat. TweenService interpolates properties like Position, Size and transparency over time, so a menu can slide in, a button can pop, and a notification can fade. This guide covers the three patterns behind almost every animated Roblox UI.",
    sections: [
      {
        heading: "1. Slide a panel into place",
        paragraphs: [
          "Start the panel off-screen, then tween its Position to the final spot. TweenInfo controls duration and easing.",
        ],
        code: `local TweenService = game:GetService("TweenService")
panel.Position = UDim2.fromScale(0.5, -0.5) -- start above the screen

local info = TweenInfo.new(0.4, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
TweenService:Create(panel, info, { Position = UDim2.fromScale(0.5, 0.5) }):Play()`,
      },
      {
        heading: "2. Fade and pop with Size",
        paragraphs: [
          "Tween Size from small to full and BackgroundTransparency from 1 to 0 for a pop-in effect. Multiple properties can go in one tween.",
        ],
        code: `panel.Size = UDim2.fromScale(0.2, 0.2)
panel.BackgroundTransparency = 1
TweenService:Create(panel, TweenInfo.new(0.3), {
\tSize = UDim2.fromScale(0.4, 0.6),
\tBackgroundTransparency = 0,
}):Play()`,
      },
      {
        heading: "3. Chain animations with Completed",
        paragraphs: [
          "Connect to a tween's Completed signal to start the next one — useful for an intro then a reveal.",
        ],
        code: `local slide = TweenService:Create(panel, TweenInfo.new(0.4), { Position = UDim2.fromScale(0.5, 0.5) })
slide.Completed:Connect(function()
\tTweenService:Create(panel, TweenInfo.new(0.2), { BackgroundTransparency = 0 }):Play()
end)
slide:Play()`,
        tip: "EasingStyle changes the feel a lot: Back overshoots (playful), Quad is smooth, Elastic bounces. Pick by mood, not randomly.",
      },
    ],
    faq: [
      {
        q: "Can I tween TextColor3 or a color?",
        a: "Yes — TweenService animates Color3 properties like TextColor3 and BackgroundColor3 the same way it animates Position.",
      },
      {
        q: "How do I make an animation loop forever?",
        a: "Set TweenInfo with Reverses = true and RepeatCount = -1, so the tween runs back and forth indefinitely.",
      },
    ],
  },
  {
    slug: "how-to-make-a-draggable-roblox-gui",
    title: "How to Make a Draggable Roblox GUI",
    description:
      "Let players drag a Roblox GUI Frame around the screen with the mouse or touch, using UserInputService — including the offset fix so it doesn't jump to the cursor.",
    category: "Interaction",
    intro:
      "A draggable window, inventory or settings panel feels native. The trick is UserInputService: start dragging on press, move the Frame on InputChanged, and stop on release. The key detail is recording the offset between the cursor and the Frame at the start, so it doesn't snap to the corner.",
    sections: [
      {
        heading: "1. Track press, move and release",
        paragraphs: [
          "Listen on the title bar (not the whole panel) so buttons inside still work. InputBegan starts the drag; UserInputService.InputChanged moves it; InputEnded stops it.",
        ],
        code: `local UserInputService = game:GetService("UserInputService")
local dragging, dragStart, startPos

titleBar.InputBegan:Connect(function(input)
\tif input.UserInputType == Enum.UserInputType.MouseButton1
\tor input.UserInputType == Enum.UserInputType.Touch then
\t\tdragging = true
\t\tdragStart = input.Position
\t\tstartPos = frame.Position
\tend
end)`,
      },
      {
        heading: "2. Move the Frame with the cursor",
        paragraphs: [
          "On InputChanged, add the cursor's travel since dragStart to the Frame's start position. Mixing Scale and Offset in UDim2.new keeps it working regardless of how the Frame was positioned.",
        ],
        code: `UserInputService.InputChanged:Connect(function(input)
\tif not dragging then return end
\tif input.UserInputType == Enum.UserInputType.MouseMovement
\tor input.UserInputType == Enum.UserInputType.Touch then
\t\tlocal delta = input.Position - dragStart
\t\tframe.Position = UDim2.new(
\t\t\tstartPos.X.Scale, startPos.X.Offset + delta.X,
\t\t\tstartPos.Y.Scale, startPos.Y.Offset + delta.Y
\t\t)
\tend
end)

UserInputService.InputEnded:Connect(function(input)
\tif input.UserInputType == Enum.UserInputType.MouseButton1
\tor input.UserInputType == Enum.UserInputType.Touch then
\t\tdragging = false
\tend
end)`,
        tip: "Drag by a title-bar Frame, not the whole panel — otherwise the drag swallows clicks on the buttons inside it.",
      },
    ],
    faq: [
      {
        q: "Why does the Frame jump to the cursor when I grab it?",
        a: "You're setting Position to the cursor directly. Instead, record startPos = frame.Position at drag start and add the cursor's delta to it, so the Frame keeps its grab point.",
      },
      {
        q: "Does this work on mobile?",
        a: "Yes — handle Enum.UserInputType.Touch the same way as MouseButton1 in InputBegan and InputEnded, and Touch in InputChanged.",
      },
    ],
  },
  {
    slug: "how-to-make-a-responsive-roblox-gui",
    title: "How to Make a Responsive Roblox GUI",
    description:
      "Make a Roblox GUI that looks right on phone, tablet and desktop: size with Scale not Offset, center with AnchorPoint, cap text with UITextSizeConstraint, and shrink whole sections with UIScale.",
    category: "Layouts",
    relatedTemplate: "main-menu",
    intro:
      "Roblox runs on everything from phones to 4K monitors, so a GUI built with fixed pixel sizes breaks on the wrong screen. The fix is to think in Scale (fractions of the screen) instead of Offset (pixels), anchor elements so they recenter, and cap text so it stays readable. This guide covers the four habits behind every responsive Roblox UI.",
    sections: [
      {
        heading: "1. Size with Scale, not Offset",
        paragraphs: [
          "UDim2 has a Scale and an Offset component. fromScale(0.4, 0.6) means 40%/60% of the screen — it adapts. fromOffset(400, 600) means fixed pixels — it doesn't.",
        ],
        code: `-- Responsive (adapts to every screen)
panel.Size = UDim2.fromScale(0.4, 0.6)
panel.Position = UDim2.fromScale(0.5, 0.5)

-- Avoid: fixed pixels look wrong on phones or 4K
panel.Size = UDim2.fromOffset(400, 600)`,
      },
      {
        heading: "2. Center with AnchorPoint",
        paragraphs: [
          "Position 0.5, 0.5 puts the top-left corner at the screen center. Set AnchorPoint 0.5, 0.5 and the element centers on its own middle instead.",
        ],
        code: `panel.AnchorPoint = Vector2.new(0.5, 0.5)
panel.Position = UDim2.fromScale(0.5, 0.5)`,
      },
      {
        heading: "3. Keep text readable",
        paragraphs: [
          "TextScaled grows text to fill its box, which gets huge on big screens. A UITextSizeConstraint caps the max size so it stays tidy.",
        ],
        code: `label.TextScaled = true
local cap = Instance.new("UITextSizeConstraint")
cap.MaxTextSize = 24
cap.Parent = label`,
        tip: "The editor's Desktop / Tablet / Mobile toggle previews the same GUI at each viewport — build with Scale and check all three.",
      },
    ],
    faq: [
      {
        q: "Why does my GUI look tiny on a phone?",
        a: "It's sized in Offset (pixels). Switch to Scale via UDim2.fromScale so the GUI is a fraction of the screen and adapts to every device.",
      },
      {
        q: "How do I shrink a whole GUI on small screens?",
        a: "Parent a UIScale to the ScreenGui and set its Scale property (e.g., 0.8) to shrink every descendant together — useful for fitting dense HUDs on phones.",
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
