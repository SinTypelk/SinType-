import { supabase } from "@/integrations/supabase/client";

// Types
export interface SiteBanner {
  id: string;
  type: string | null;
  title: string;
  message: string;
  is_active: boolean;
  color_scheme: "warning" | "info" | "success" | "danger";
  show_on: "download" | "home" | "all";
  created_at: string;
  updated_at: string;
}

export interface AppVersion {
  id: string;
  channel: "stable" | "beta";
  version_string: string;
  download_url: string;
  release_date: string | null;
  is_active: boolean;
  show_beta_warning: boolean;
  created_at: string;
}

export interface KeyFeature {
  id: string;
  page: "home" | "download";
  icon: string;
  title: string;
  description: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
}

export interface DownloadPageConfig {
  id: string;
  field_key: string;
  field_value: string;
  updated_at: string;
}

// Banners
export async function fetchBanners(): Promise<SiteBanner[]> {
  const { data, error } = await supabase.from("site_banners").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as SiteBanner[];
}

export async function fetchActiveBanners(
  showOn: "download" | "home" | "all" = "all",
): Promise<SiteBanner[]> {
  let query = supabase.from("site_banners").select("*").eq("is_active", true);

  if (showOn !== "all") {
    query = query.or(`show_on.eq.${showOn},show_on.eq.all`);
  } else {
    query = query;
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as SiteBanner[];
}

export async function createBanner(
  dataOrTitle: Partial<SiteBanner> | string,
  message?: string,
  show_on?: "download" | "home" | "all",
  color_scheme?: "warning" | "info" | "success" | "danger",
  is_active?: boolean,
): Promise<SiteBanner> {
  let insertData: Partial<SiteBanner>;

  if (typeof dataOrTitle === "string") {
    // Legacy: individual parameters
    insertData = {
      title: dataOrTitle,
      message: message || "",
      show_on: show_on || "all",
      color_scheme: color_scheme || "info",
      is_active: is_active || false,
    };
  } else {
    // New: object parameter
    insertData = dataOrTitle;
  }

  const { data, error } = await supabase
    .from("site_banners")
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return data as SiteBanner;
}

export async function updateBanner(
  id: string,
  updates: Partial<Omit<SiteBanner, "id" | "created_at">>,
): Promise<SiteBanner> {
  const { data, error } = await supabase
    .from("site_banners")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as SiteBanner;
}

export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from("site_banners").delete().eq("id", id);
  if (error) throw error;
}

// App Versions
export async function fetchAppVersions(): Promise<AppVersion[]> {
  const { data, error } = await supabase.from("app_versions").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as AppVersion[];
}

export async function fetchActiveAppVersion(channel: "stable" | "beta"): Promise<AppVersion | null> {
  const { data, error } = await supabase
    .from("app_versions")
    .select("*")
    .eq("channel", channel)
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return (data || null) as AppVersion | null;
}

export async function updateOrCreateAppVersion(
  channel: "stable" | "beta",
  updates: Omit<AppVersion, "id" | "created_at" | "channel">,
): Promise<AppVersion> {
  // First check if version exists for this channel
  const existing = await fetchAppVersions();
  const versionRecord = existing.find((v) => v.channel === channel);

  if (versionRecord) {
    // Update existing
    const { data, error } = await supabase
      .from("app_versions")
      .update(updates)
      .eq("id", versionRecord.id)
      .select()
      .single();

    if (error) throw error;
    return data as AppVersion;
  } else {
    // Create new
    const { data, error } = await supabase
      .from("app_versions")
      .insert({
        channel,
        ...updates,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AppVersion;
  }
}

// Key Features
export async function fetchFeatures(page: "home" | "download"): Promise<KeyFeature[]> {
  const { data, error } = await supabase
    .from("key_features")
    .select("*")
    .eq("page", page)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data || []) as KeyFeature[];
}

export async function fetchVisibleFeatures(page: "home" | "download"): Promise<KeyFeature[]> {
  const { data, error } = await supabase
    .from("key_features")
    .select("*")
    .eq("page", page)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data || []) as KeyFeature[];
}

export async function createFeature(
  pageOrData: "home" | "download" | Partial<KeyFeature>,
  icon?: string,
  title?: string,
  description?: string,
  is_visible?: boolean,
): Promise<KeyFeature> {
  let insertData: Record<string, any>;
  let page: "home" | "download";

  if (typeof pageOrData === "string") {
    // Legacy: individual parameters
    page = pageOrData;
    insertData = {
      page,
      icon: icon || "",
      title: title || "",
      description: description || "",
      is_visible: is_visible !== false,
    };
  } else {
    // New: object parameter
    page = pageOrData.page || "home";
    insertData = pageOrData;
  }

  // Get max display_order for this page
  const existing = await fetchFeatures(page);
  const maxOrder = Math.max(0, ...existing.map((f) => f.display_order));

  const { data, error } = await supabase
    .from("key_features")
    .insert({
      ...insertData,
      display_order: insertData.display_order || maxOrder + 1,
    })
    .select()
    .single();

  if (error) throw error;
  return data as KeyFeature;
}

export async function updateFeature(
  id: string,
  updates: Partial<Omit<KeyFeature, "id" | "created_at">>,
): Promise<KeyFeature> {
  const { data, error } = await supabase
    .from("key_features")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as KeyFeature;
}

export async function deleteFeature(id: string): Promise<void> {
  const { error } = await supabase.from("key_features").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderFeatures(
  idOrFeatures: string | Array<{ id: string; display_order: number }>,
  newOrder?: number,
): Promise<void> {
  let featuresToUpdate: Array<{ id: string; display_order: number }>;

  if (typeof idOrFeatures === "string" && newOrder !== undefined) {
    // Legacy: individual id and order
    featuresToUpdate = [{ id: idOrFeatures, display_order: newOrder }];
  } else {
    // New: array of features
    featuresToUpdate = idOrFeatures as Array<{ id: string; display_order: number }>;
  }

  for (const feature of featuresToUpdate) {
    const { error } = await supabase
      .from("key_features")
      .update({ display_order: feature.display_order })
      .eq("id", feature.id);

    if (error) throw error;
  }
}

// Download Page Config
export async function fetchDownloadPageConfig(): Promise<DownloadPageConfig[]> {
  const { data, error } = await supabase.from("download_page_config").select("*");
  if (error) throw error;
  return (data || []) as DownloadPageConfig[];
}

export async function fetchDownloadPageConfigAsRecord(): Promise<Record<string, string>> {
  const data = await fetchDownloadPageConfig();
  const config: Record<string, string> = {};
  for (const row of data) {
    config[row.field_key] = row.field_value;
  }
  return config;
}

export async function getConfigValue(fieldKey: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("download_page_config")
    .select("field_value")
    .eq("field_key", fieldKey)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return (data?.field_value as string) || null;
}

export async function upsertDownloadPageConfig(
  updates: Record<string, string> | Array<{ field_key: string; field_value: string }>,
): Promise<DownloadPageConfig[]> {
  let records: Array<{ field_key: string; field_value: string; updated_at: string }>;

  if (Array.isArray(updates)) {
    // Array format
    records = updates.map((item) => ({
      field_key: item.field_key,
      field_value: item.field_value,
      updated_at: new Date().toISOString(),
    }));
  } else {
    // Record format
    records = Object.entries(updates).map(([field_key, field_value]) => ({
      field_key,
      field_value,
      updated_at: new Date().toISOString(),
    }));
  }

  const { error } = await supabase.from("download_page_config").upsert(records, { onConflict: "field_key" });

  if (error) throw error;
  return records as DownloadPageConfig[];
}
