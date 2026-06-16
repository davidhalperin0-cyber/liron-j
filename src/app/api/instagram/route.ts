import { NextResponse } from "next/server";

// Instagram feed proxy. Uses INSTAGRAM_TOKEN (Instagram Graph API access token)
// if configured; otherwise returns an empty list so the UI shows the graceful
// "follow us" fallback. Cached for an hour.
export const revalidate = 3600;

interface IgMedia {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
}

export async function GET() {
  const token = process.env.INSTAGRAM_TOKEN;
  if (!token) {
    return NextResponse.json({ posts: [], configured: false });
  }

  try {
    const fields = "id,media_type,media_url,thumbnail_url,permalink,caption";
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=${fields}&limit=8&access_token=${token}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return NextResponse.json({ posts: [], configured: true, error: true });

    const data = await res.json();
    const posts = (data.data ?? [])
      .filter((m: IgMedia) => m.media_type !== "VIDEO" || m.thumbnail_url)
      .slice(0, 8)
      .map((m: IgMedia) => ({
        id: m.id,
        image: m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url,
        permalink: m.permalink,
        caption: m.caption ?? "",
      }));

    return NextResponse.json({ posts, configured: true });
  } catch {
    return NextResponse.json({ posts: [], configured: true, error: true });
  }
}
