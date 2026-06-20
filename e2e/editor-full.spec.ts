import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { strFromU8, unzipSync } from "fflate";

test("@full preserves and exports server-backed actions", async ({ page }) => {
  const consoleErrors: string[] = [];
  let thumbnailAvailable = true;
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.route("https://thumbnails.roblox.com/**", async (route) => {
    if (!thumbnailAvailable) {
      await route.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ data: [{ state: "Pending" }] }),
      });
      return;
    }
    await route.fulfill({
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({
        data: [
          {
            state: "Completed",
            imageUrl: "https://tr.rbxcdn.com/editor-test.png",
          },
        ],
      }),
    });
  });
  await page.route("https://tr.rbxcdn.com/editor-test.png", async (route) => {
    await route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "base64"
      ),
    });
  });

  await page.goto("/editor");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByRole("button", { name: /ImageLabel/ }).click();
  const assetId = page.getByRole("textbox", { name: "Roblox asset ID" });
  await assetId.fill("https://example.com/a.png");
  await expect(
    page.getByText("Enter a numeric Roblox asset ID.")
  ).toBeVisible();
  await expect(page.getByLabel("Client Luau code")).not.toContainText(
    "example.com"
  );
  await assetId.fill("123");
  await page.waitForTimeout(400);
  await assetId.fill("1818");
  await page.waitForTimeout(400);
  await expect(page.getByLabel("Client Luau code")).toContainText(
    'Image = "rbxassetid://1818"'
  );
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(assetId).toHaveValue("rbxassetid://123");
  await page.getByRole("button", { name: "Redo" }).click();
  await expect(assetId).toHaveValue("rbxassetid://1818");
  await expect(page.locator('[data-image-state="loaded"]')).toBeVisible();
  await page
    .getByRole("textbox", { name: "Image tint", exact: true })
    .fill("#12abef");
  await page.getByRole("checkbox", { name: "Enable stroke" }).check();
  await page
    .getByRole("textbox", { name: "Stroke color", exact: true })
    .fill("#010203");
  await page.getByRole("spinbutton", { name: "Stroke transparency" }).fill("0.25");
  await page.getByRole("spinbutton", { name: "Stroke thickness" }).fill("2");
  await page.getByRole("spinbutton", { name: "Rotation" }).fill("15");
  await expect(page.getByLabel("Client Luau code")).toContainText(
    "Rotation = 15"
  );

  await page.locator('[data-node-id="title"]').click();
  await page.getByRole("checkbox", { name: "Scale text to fit" }).check();
  await page.getByRole("checkbox", { name: "Wrap text" }).check();
  await expect(page.getByLabel("Client Luau code")).toContainText(
    "TextScaled = true"
  );
  await expect(page.getByLabel("Client Luau code")).toContainText(
    "TextWrapped = true"
  );

  await page.getByRole("button", { name: "Hierarchy" }).click();
  await page.getByRole("treeitem", { name: /PlayBtn/ }).click();

  const actionSelect = page.locator("select").filter({
    has: page.locator('option[value="teleport"]'),
  });
  await actionSelect.selectOption("teleport");
  const placeId = page.getByRole("textbox", {
    name: "Destination Place ID",
  });
  await placeId.fill("01");
  await expect(page.getByText("Place ID cannot start with zero.")).toBeVisible();
  await placeId.fill("9007199254740992");
  await expect(page.getByText("Place ID is too large.")).toBeVisible();
  await placeId.fill("12345678901234");
  await page.waitForTimeout(400);
  await placeId.fill("456");
  await page.waitForTimeout(400);

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(placeId).toHaveValue("12345678901234");
  await page.getByRole("button", { name: "Redo" }).click();
  await expect(placeId).toHaveValue("456");

  await page.waitForTimeout(450);
  thumbnailAvailable = false;
  await page.reload();
  await expect(page.locator('[data-image-state="unavailable"]')).toBeVisible();
  await page.getByRole("button", { name: "Hierarchy" }).click();
  await page.getByRole("treeitem", { name: /Image Image/ }).click();
  await expect(assetId).toHaveValue("rbxassetid://1818");
  await expect(
    page.getByRole("textbox", { name: "Image tint", exact: true })
  ).toHaveValue("#12abef");
  await expect(page.getByRole("spinbutton", { name: "Rotation" })).toHaveValue(
    "15"
  );
  await expect(page.getByRole("checkbox", { name: "Enable stroke" })).toBeChecked();
  await expect(
    page.getByRole("spinbutton", { name: "Stroke transparency" })
  ).toHaveValue("0.25");
  await expect(
    page.getByRole("spinbutton", { name: "Stroke thickness" })
  ).toHaveValue("2");
  await page.getByRole("treeitem", { name: /Title Title/ }).click();
  await expect(
    page.getByRole("checkbox", { name: "Scale text to fit" })
  ).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Wrap text" })).toBeChecked();
  await page.getByRole("treeitem", { name: /PlayBtn/ }).click();
  await expect(
    page.getByRole("textbox", { name: "Destination Place ID" })
  ).toHaveValue("456");

  const jsonDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const jsonDownload = await jsonDownloadPromise;
  const jsonPath = await jsonDownload.path();
  expect(jsonDownload.suggestedFilename()).toBe("game-menu.json");
  if (!jsonPath) throw new Error("Expected the JSON download path");
  const exportedProject = JSON.parse(await readFile(jsonPath, "utf8"));
  expect(
    exportedProject.scene.find((item: { cls: string }) => item.cls === "ImageLabel")
  ).toMatchObject({
    image: "rbxassetid://1818",
    imageColor: "#12abef",
    rotation: 15,
    stroke: { color: "#010203", transparency: 0.25, thickness: 2 },
  });
  expect(
    exportedProject.scene.find((item: { id: string }) => item.id === "title")
  ).toMatchObject({ textScaled: true, textWrapped: true });

  await actionSelect.selectOption("none");
  await expect(page.getByLabel("Client Luau code")).not.toContainText(
    "TeleportRequest"
  );
  await page
    .locator('input[type="file"][aria-label="Import JSON"]')
    .setInputFiles(jsonPath);
  await expect(page.getByLabel("Client Luau code")).toContainText(
    'teleportRequest:FireServer("456")'
  );
  await expect(page.getByLabel("Client Luau code")).toContainText(
    'Image = "rbxassetid://1818"'
  );
  await expect(page.getByLabel("Client Luau code")).toContainText(
    "ImageColor3 = Color3.fromRGB(18, 171, 239)"
  );
  await expect(page.getByLabel("Client Luau code")).toContainText(
    "TextScaled = true"
  );
  await page.getByRole("treeitem", { name: /Image Image/ }).click();
  await expect(assetId).toHaveValue("rbxassetid://1818");

  await page.getByRole("button", { name: "Hierarchy" }).click();
  await page.getByRole("treeitem", { name: /SettingsBtn/ }).click();
  await actionSelect.selectOption("remoteEvent");
  await page
    .getByRole("textbox", { name: "RemoteEvent name" })
    .fill("TeleportRequest");
  await page.getByRole("tab", { name: "Server" }).click();
  const serverCode = page.getByLabel("Server Luau code");
  await expect(serverCode).toContainText(
    'remotes:FindFirstChild("TeleportRequest")'
  );
  await expect(serverCode).toContainText(
    'rgm:FindFirstChild("TeleportRequest")'
  );

  let downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download ZIP" }).click();
  const packageDownload = await downloadPromise;
  const packagePath = await packageDownload.path();
  expect(packageDownload.suggestedFilename()).toBe("game-menu.zip");
  if (!packagePath) throw new Error("Expected the ZIP download path");
  const packageFiles = unzipSync(await readFile(packagePath));
  const packagedProject = strFromU8(packageFiles["project.json"]);
  const packagedClient = strFromU8(packageFiles["roblox-gui.client.lua"]);
  expect(packagedProject).toContain(
    '"format": "roblox-gui-maker"'
  );
  expect(packagedProject).toContain('"image": "rbxassetid://1818"');
  expect(packagedProject).toContain('"imageColor": "#12abef"');
  expect(packagedProject).toContain('"textScaled": true');
  expect(packagedClient).toContain(
    'teleportRequest:FireServer("456")'
  );
  expect(packagedClient).toContain('Image = "rbxassetid://1818"');
  expect(packagedClient).toContain(
    "ImageColor3 = Color3.fromRGB(18, 171, 239)"
  );
  expect(packagedClient).toContain('Instance.new("UIStroke")');
  expect(packagedClient).toContain("TextScaled = true");
  expect(strFromU8(packageFiles["roblox-gui.server.lua"])).toContain(
    "TeleportService:TeleportAsync(numericPlaceId, { player })"
  );

  await page.getByRole("tab", { name: "Client" }).click();
  downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download .lua", exact: true })
    .click();
  const clientDownload = await downloadPromise;
  const clientPath = await clientDownload.path();
  expect(clientDownload.suggestedFilename()).toBe("roblox-gui.lua");
  if (!clientPath) throw new Error("Expected the client Luau download path");
  expect(await readFile(clientPath, "utf8")).toContain(
    'teleportRequest:FireServer("456")'
  );

  await page.getByRole("tab", { name: "Server" }).click();
  downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download .server.lua", exact: true })
    .click();
  const serverDownload = await downloadPromise;
  const serverPath = await serverDownload.path();
  expect(serverDownload.suggestedFilename()).toBe("roblox-gui.server.lua");
  if (!serverPath) throw new Error("Expected the server Luau download path");
  expect(await readFile(serverPath, "utf8")).toContain(
    "TeleportService:TeleportAsync(numericPlaceId, { player })"
  );

  await page.getByRole("button", { name: "Preview" }).click();
  await page.locator('[data-node-id="play"]').dispatchEvent("pointerdown");
  await expect(page.getByRole("status")).toHaveText(
    "Teleport to Place 456. Preview does not run live teleports."
  );
  expect(
    await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
  ).toEqual({ innerWidth: 1280, scrollWidth: 1280 });
  expect(consoleErrors).toEqual([]);
});
