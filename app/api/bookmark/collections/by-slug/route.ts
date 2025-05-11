import { NextRequest, NextResponse } from "next/server";
import { getBookmarkCollectionByUserAndSlug } from "@/services/bookmark/collection";

// GET /api/bookmark/collections/by-slug
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const slug = searchParams.get("slug");
    
    if (!username || !slug) {
      return NextResponse.json({ error: "Username and slug are required" }, { status: 400 });
    }
    
    const collection = await getBookmarkCollectionByUserAndSlug(username, slug);
    
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    
    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error in GET /api/bookmark/collections/by-slug:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
