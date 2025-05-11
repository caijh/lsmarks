export interface BookmarkAuthResult {
  authorized: boolean;
  reason?: string;
}

export interface BookmarkOwnershipResult {
  isOwner: boolean;
  reason?: string;
}

export interface BookmarkUserPreferences {
  username?: string;
  display_name?: string;
  bio?: string;
  color_theme?: string;
  customColors?: Record<string, string>;
}

export interface UserPreferencesUpdateRequest {
  color_theme?: string;
  theme?: string;
  username?: string;
  display_name?: string;
  bio?: string;
  preferences?: {
    customColors?: Record<string, string>;
    [key: string]: any;
  };
}
