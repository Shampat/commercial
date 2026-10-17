-- Self-service marketplace ownership and Row Level Security.
--
-- The production listings table already uses created_by = auth.uid() for
-- ownership and listing_status for lifecycle state. This migration preserves
-- that existing model instead of introducing a parallel owner_id/status model.
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
      AND column_name = 'created_by'
      AND data_type = 'uuid'
  ) THEN
    RAISE EXCEPTION 'public.listings.created_by uuid column is required for marketplace ownership';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'listings'
      AND column_name = 'status'
      AND udt_name = 'listing_status'
  ) THEN
    RAISE EXCEPTION 'public.listings.status listing_status column is required for marketplace lifecycle state';
  END IF;
END
$$;

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- The existing production policies already enforce ownership through
-- created_by = auth.uid(). Keep those policies intact and add the missing
-- delete policy required by the self-service account workspace.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'listings'
      AND policyname = 'Users can delete own listings'
  ) THEN
    CREATE POLICY "Users can delete own listings"
      ON public.listings
      FOR DELETE
      TO authenticated
      USING (created_by = auth.uid());
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS listings_created_by_idx
  ON public.listings(created_by);

-- Keep the production ACTIVE/expiry public-read model. Do not add a separate
-- is_public flag: public visibility is already determined by the existing
-- public policy and listing lifecycle status.
COMMENT ON COLUMN public.listings.created_by IS
  'Authenticated marketplace account that controls this listing.';
