import { NextRequest, NextResponse } from "next/server";
import { getBookmarkItemsByCollection } from "@/services/bookmark/item";

// GET /api/bookmark/collections/[uuid]/bookmarks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  let uuid = '';
  try {
    const resolvedParams = await params;
    uuid = resolvedParams.uuid;
    
    const bookmarks = await getBookmarkItemsByCollection(uuid);
    
    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error(`Error in GET /api/bookmark/collections/${uuid}/bookmarks:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
