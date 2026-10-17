-- Self-service marketplace ownership and Row Level Security.
--
-- This migration deliberately does not touch PostGIS/system tables such as
-- public.spatial_ref_sys. Public marketplace views are expected to use
-- security_invoker=true so these table policies are respected.

DO $$
BEGIN
  IF to_regclass('public.listings') IS NULL THEN
    RAISE EXCEPTION 'public.listings does not exist; refusing to install marketplace ownership policies';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'listings'
      AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.listings
      ADD COLUMN owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'listings'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.listings
      ADD COLUMN status text NOT NULL DEFAULT 'draft';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'listings'
      AND column_name = 'is_public'
  ) THEN
    ALTER TABLE public.listings
      ADD COLUMN is_public boolean NOT NULL DEFAULT false;
  END IF;
END
$$;

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Remove old policies with these names so this migration is safe to rerun.
DROP POLICY IF EXISTS "listings_public_read_published" ON public.listings;
DROP POLICY IF EXISTS "listings_owner_read" ON public.listings;
DROP POLICY IF EXISTS "listings_owner_insert" ON public.listings;
DROP POLICY IF EXISTS "listings_owner_update" ON public.listings;
DROP POLICY IF EXISTS "listings_owner_delete" ON public.listings;

-- Anonymous visitors may only read listings explicitly published by their owner.
CREATE POLICY "listings_public_read_published"
  ON public.listings
  FOR SELECT
  USING (is_public = true AND status = 'published');

-- Signed-in owners can read their own listings, including drafts.
CREATE POLICY "listings_owner_read"
  ON public.listings
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- A new listing can only be created for the currently authenticated account.
CREATE POLICY "listings_owner_insert"
  ON public.listings
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Owners may change only their own rows. The owner_id itself cannot be
-- transferred through this policy because the resulting row must still match
-- auth.uid().
CREATE POLICY "listings_owner_update"
  ON public.listings
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "listings_owner_delete"
  ON public.listings
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE INDEX IF NOT EXISTS listings_owner_id_idx
  ON public.listings(owner_id);

CREATE INDEX IF NOT EXISTS listings_public_status_idx
  ON public.listings(is_public, status);

COMMENT ON COLUMN public.listings.owner_id IS
  'Authenticated marketplace account that controls this listing.';
COMMENT ON COLUMN public.listings.status IS
  'Marketplace lifecycle state; self-service listings start as draft.';
COMMENT ON COLUMN public.listings.is_public IS
  'Explicit public visibility flag; public reads also require status=published.';
