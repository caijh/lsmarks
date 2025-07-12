import { Metadata } from "next";
import { SearchResultsView } from "@/components/search/search-results-view";

export const metadata: Metadata = {
  title: "搜索结果 - LSMarks",
  description: "在 LSMarks 中搜索书签、集合和分类",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    date?: string;
    collection?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <SearchResultsView initialParams={params} />
    </div>
  );
}
