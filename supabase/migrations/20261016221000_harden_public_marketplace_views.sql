-- Harden public marketplace views so they execute with the caller's privileges
-- and respect RLS on the underlying tables.
--
-- Do NOT enable RLS on public.spatial_ref_sys just to silence the Security
-- Advisor: it is a PostGIS system table and should be handled by relocating
-- the PostGIS extension out of public when the database setup permits it.

DO $$
BEGIN
  IF to_regclass('public.public_property_marketplace') IS NOT NULL THEN
    ALTER VIEW public.public_property_marketplace
      SET (security_invoker = true);
  END IF;

  IF to_regclass('public.public_marketplace_listings') IS NOT NULL THEN
    ALTER VIEW public.public_marketplace_listings
      SET (security_invoker = true);
  END IF;
END
$$;
