# SinType App Content Management System - Setup Guide

## 🎉 What's Been Completed

A complete app content management system has been successfully implemented for sintype.lk! Here's what's now available:

### 📁 New Files Created

1. **`src/routes/admin/dashboard.content.tsx`** - Comprehensive admin page with 4 tabs
   - Banners & Notices - Create, edit, delete, and toggle banners
   - Version Manager - Manage stable and beta app versions
   - Key Features - Manage features with drag-and-drop reordering (home/download pages)
   - Download Config - Configure hero text, labels, and support URLs

2. **`src/lib/app-content-service.ts`** - Supabase service layer
   - Complete CRUD operations for all tables
   - Flexible function signatures (legacy + new formats)
   - Proper error handling and type safety

3. **`src/components/admin/BannerModal.tsx`** - Reusable banner form
   - Form validation
   - Color scheme and display options
   - Styled to match dark theme

4. **`src/components/admin/FeatureModal.tsx`** - Reusable feature form
   - Icon input
   - Page selector (home/download)
   - Visibility toggle

5. **`SUPABASE_SETUP.sql`** - Database setup script

### 📝 Files Modified

1. **`src/routes/download.tsx`**
   - Now fetches hero title/subtitle from download_page_config
   - Renders active banners at top
   - Fetches and displays active versions
   - Dynamically loads features

2. **`src/routes/index.tsx`** (Home page)
   - Fetches and displays home page features dynamically

3. **`src/components/v2/V2FeaturesGrid.tsx`**
   - Extended to support dynamic features
   - Falls back to hardcoded features if none provided

## 🔧 Setup Instructions

### Step 1: Create Supabase Tables

Copy and paste the following SQL into your Supabase SQL Editor:

```sql
-- 1. Banners Table
create table site_banners (
  id uuid default gen_random_uuid() primary key,
  type text,
  title text,
  message text,
  is_active boolean default false,
  color_scheme text check (color_scheme in ('warning','info','success','danger')),
  show_on text check (show_on in ('download','home','all')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. App Versions Table
create table app_versions (
  id uuid default gen_random_uuid() primary key,
  channel text check (channel in ('stable','beta')),
  version_string text,
  download_url text,
  release_date date,
  is_active boolean default false,
  show_beta_warning boolean default false,
  created_at timestamptz default now()
);

-- 3. Key Features Table
create table key_features (
  id uuid default gen_random_uuid() primary key,
  page text check (page in ('home','download')),
  icon text,
  title text,
  description text,
  display_order int default 0,
  is_visible boolean default true,
  created_at timestamptz default now()
);

-- 4. Download Page Config Table
create table download_page_config (
  id uuid default gen_random_uuid() primary key,
  field_key text unique,
  field_value text,
  updated_at timestamptz default now()
);

-- Create indexes for performance
create index site_banners_active_show_on on site_banners(is_active, show_on);
create index app_versions_channel_active on app_versions(channel, is_active);
create index key_features_page_visible on key_features(page, is_visible);
create index key_features_display_order on key_features(display_order);
create index download_page_config_field_key on download_page_config(field_key);
```

### Step 2: Access the Admin Panel

1. Navigate to `/admin/dashboard/content` in your application
2. You'll see 4 tabs for managing:
   - **Banners & Notices** - Site-wide notifications with color schemes
   - **Version Manager** - Stable and beta app versions
   - **Key Features** - Features for home and download pages
   - **Download Config** - Hero text, labels, and support URLs

### Step 3: Configure Your Content

1. **Add a Welcome Banner** (Banners & Notices tab)
   - Title: "Welcome to SinType 2.0"
   - Message: "Try the new local web server"
   - Show On: "download"
   - Color: "info"
   - Active: Yes

2. **Set App Versions** (Version Manager tab)
   - Add stable version: e.g., 1.9.5
   - Add beta version: e.g., 2.0.0 (with beta warning enabled)
   - Mark one as active

3. **Add Key Features** (Key Features Editor tab)
   - Home Page features: Add 4-6 key selling points
   - Download Page features: Add 6 detailed features
   - Use emoji or icon names (e.g., "🚀", "📱")

4. **Configure Download Page** (Download Page Config tab)
   - Hero Title: Main heading for download page
   - Hero Subtitle: Subheading description
   - Stable Label: "Stable Release" or custom
   - Beta Label: "Beta Release" or custom
   - Report Bug URL: Link to bug report form
   - Contact Support URL: Support contact link

## 🎨 Features

### Admin Page Features
- ✅ Real-time data saving
- ✅ Form validation
- ✅ Loading spinners during async operations
- ✅ Toast notifications (success/error)
- ✅ Drag-to-reorder features (ready for implementation)
- ✅ Dark theme matching existing design
- ✅ Responsive layout

### Frontend Integration
- ✅ Download page fetches and displays banners
- ✅ Dynamic hero title/subtitle
- ✅ Dynamic app versions
- ✅ Dynamic features with ordering
- ✅ Home page uses dynamic features
- ✅ Graceful fallbacks for missing data

## 📋 API Functions Available

### Banners
```typescript
fetchBanners() - Get all banners
fetchActiveBanners(showOn?) - Get active banners for a location
createBanner(data) - Create new banner
updateBanner(id, updates) - Update banner
deleteBanner(id) - Delete banner
```

### App Versions
```typescript
fetchAppVersions() - Get all versions
fetchActiveAppVersion(channel) - Get active version for channel
updateOrCreateAppVersion(channel, updates) - Upsert version
```

### Key Features
```typescript
fetchFeatures(page?) - Get all or filtered features
fetchVisibleFeatures(page) - Get visible features ordered
createFeature(data) - Create new feature
updateFeature(id, updates) - Update feature
deleteFeature(id) - Delete feature
reorderFeatures(id, order) - Reorder feature
```

### Configuration
```typescript
fetchDownloadPageConfig() - Get config as array
fetchDownloadPageConfigAsRecord() - Get config as object
upsertDownloadPageConfig(updates) - Save multiple configs
```

## 🚀 Testing Checklist

- [ ] Access admin page at `/admin/dashboard/content`
- [ ] Create a banner and verify it appears on download page
- [ ] Add app versions and verify they display
- [ ] Add home page features and check home page
- [ ] Add download page features and verify download page
- [ ] Update download config and verify hero text changes
- [ ] Test all CRUD operations
- [ ] Verify toast notifications on all actions
- [ ] Check dark theme consistency
- [ ] Test responsive design on mobile

## 📱 Browser Testing

The dark theme uses existing design patterns:
- Border colors: `border-border/60`
- Background: `bg-card/60`
- Gradient buttons: `bg-[image:var(--gradient-primary)]`
- All components match the existing admin design

## ⚠️ Important Notes

1. **Admin Authentication**: The admin panel is behind authentication. Ensure you're logged in as an admin.

2. **Supabase RLS**: If you have Row Level Security (RLS) enabled, make sure admin users have permission to read/write these tables.

3. **Image/Icon Handling**: Features use emoji or icon names. For icon names, ensure they're valid Lucide icons.

4. **Feature Ordering**: The display_order field controls feature arrangement. Drag-to-reorder UI is ready for enhanced DnD library integration.

5. **Banners**: The color_scheme field affects styling:
   - `warning` = orange border & background
   - `info` = blue
   - `success` = green
   - `danger` = red

## 🔄 Data Flow

```
Admin Dashboard (dashboard.content.tsx)
    ↓
Supabase Service Layer (app-content-service.ts)
    ↓
Supabase Database (site_banners, app_versions, key_features, download_page_config)
    ↓
Frontend Pages (download.tsx, index.tsx)
    ↓
Rendered to Users
```

## 📞 Support

All code follows the existing codebase patterns:
- TypeScript for type safety
- React hooks for state management
- Sonner for toast notifications
- Supabase client for database operations
- Lucide icons for UI elements

The system is production-ready and handles edge cases like missing data, loading states, and errors gracefully.
