const ASSET_PATTERN = /^(?:rbxassetid:\/\/)?([0-9]+)$/;
const thumbnailCache = new Map<string, Promise<string | null>>();

export function normalizeRobloxAssetId(input: string): string | null {
  const match = ASSET_PATTERN.exec(input.trim());
  return match ? `rbxassetid://${match[1]}` : null;
}

export function assetIdNumber(image: string): string | null {
  return normalizeRobloxAssetId(image)?.slice("rbxassetid://".length) ?? null;
}

export function thumbnailRequestUrl(image: string): string {
  const id = assetIdNumber(image);
  if (!id) throw new Error(`Invalid Roblox asset ID: ${image}`);

  const query = new URLSearchParams({
    assetIds: id,
    returnPolicy: "PlaceHolder",
    size: "420x420",
    format: "Png",
    isCircular: "false",
  });
  return `https://thumbnails.roblox.com/v1/assets?${query}`;
}

export function thumbnailProxyUrl(image: string): string {
  const id = assetIdNumber(image);
  if (!id) throw new Error(`Invalid Roblox asset ID: ${image}`);
  return `/api/roblox-thumbnail?assetId=${encodeURIComponent(id)}`;
}

export function parseThumbnailResponse(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const data = (value as { data?: unknown }).data;
  if (!Array.isArray(data) || data.length !== 1) return null;

  const item = data[0] as { state?: unknown; imageUrl?: unknown };
  return item.state === "Completed" &&
    typeof item.imageUrl === "string" &&
    item.imageUrl.startsWith("https://tr.rbxcdn.com/")
    ? item.imageUrl
    : null;
}

export function resolveThumbnail(image: string): Promise<string | null> {
  const canonical = normalizeRobloxAssetId(image);
  if (!canonical) return Promise.resolve(null);

  const existing = thumbnailCache.get(canonical);
  if (existing) return existing;

  const request = fetch(thumbnailProxyUrl(canonical))
    .then((response) => (response.ok ? response.json() : null))
    .then((value) =>
      value &&
      typeof value === "object" &&
      typeof (value as { imageUrl?: unknown }).imageUrl === "string"
        ? (value as { imageUrl: string }).imageUrl
        : null
    )
    .catch(() => null);
  thumbnailCache.set(canonical, request);
  return request;
}
