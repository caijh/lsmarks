import { NextRequest, NextResponse } from "next/server";
import { getBookmarkCategoriesByCollection } from "@/services/bookmark/category";

// GET /api/bookmark/collections/[uuid]/categories
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  let uuid = '';
  try {
    const resolvedParams = await params;
    uuid = resolvedParams.uuid;
    
    const categories = await getBookmarkCategoriesByCollection(uuid);
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error(`Error in GET /api/bookmark/collections/${uuid}/categories:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
