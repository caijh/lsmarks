export interface BookmarkUrlStats {
  id?: number;
  normalized_url: string;
  original_url: string;
  title?: string;
  description?: string;
  icon_url?: string;
  add_count: number;
  first_added_at?: string;
  last_added_at?: string;
}
