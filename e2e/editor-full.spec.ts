import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { strFromU8, unzipSync } from "fflate";

test("@full preserves and exports server-backed actions", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/editor");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

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
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Destination Place ID" })
  ).toHaveValue("456");

  const jsonDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const jsonDownload = await jsonDownloadPromise;
  const jsonPath = await jsonDownload.path();
  expect(jsonDownload.suggestedFilename()).toBe("game-menu.json");
  if (!jsonPath) throw new Error("Expected the JSON download path");

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

  await page.locator('[data-node-id="settings"]').click();
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
  expect(strFromU8(packageFiles["project.json"])).toContain(
    '"format": "roblox-gui-maker"'
  );
  expect(strFromU8(packageFiles["roblox-gui.client.lua"])).toContain(
    'teleportRequest:FireServer("456")'
  );
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
  await page.locator('[data-node-id="play"]').click();
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
