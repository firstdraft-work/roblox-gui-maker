import {
  parseThumbnailResponse,
  thumbnailRequestUrl,
} from "../../editor/image-assets";

const ASSET_ID_PATTERN = /^[1-9][0-9]{0,19}$/;

export async function GET(request: Request) {
  const assetId = new URL(request.url).searchParams.get("assetId") ?? "";
  if (!ASSET_ID_PATTERN.test(assetId)) {
    return Response.json(
      { error: `Invalid Roblox asset ID: ${assetId}` },
      { status: 400 }
    );
  }

  const response = await fetch(thumbnailRequestUrl(assetId), {
    headers: { accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    return Response.json(
      { error: `Roblox thumbnail request failed with ${response.status}` },
      { status: 502 }
    );
  }

  return Response.json(
    { imageUrl: parseThumbnailResponse(await response.json()) },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
  );
}
