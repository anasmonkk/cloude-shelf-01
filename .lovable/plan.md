# Make rental items visible to the public on /browse

## What's wrong

There are 2 active items in the database, but the /browse page shows nothing. Confirmed by checking the database:

- Every read rule on `items`, `categories`, and `delivery_config` is granted only to signed-in users. Visitors who are not logged in (the "anon" role) match no rule, so the queries return empty lists.
- No table-level Data API permissions exist for these tables at all, which also blocks reads through the app's API layer.

Result: the browse page loads, gets zero rows, and renders "No items found".

## What to change

1. Allow public read access to the data needed for browsing:
   - Active items only (drafts, pending-approval, inactive and rejected items stay hidden from visitors).
   - Categories (used for the filter buttons).
   - Delivery charge config (used for the total price).
2. Keep personal data private: customer/vendor profiles stay restricted to signed-in users. On /browse, the vendor name line will show for signed-in users and be omitted for visitors instead of exposing profile data publicly.
3. Fix the delivery charge lookup so a missing config row no longer produces an error response; fall back to the default charge.
4. Clicking an item still requires customer login (existing behaviour, unchanged).

## Technical details

Migration:

- `GRANT SELECT ON public.items, public.categories, public.delivery_config TO anon;` plus the standard `authenticated` / `service_role` grants for these three tables.
- Add anon SELECT policies:
  - `items`: `USING (status = 'active')` for role `anon`.
  - `categories`: `USING (true)` for role `anon`.
  - `delivery_config`: `USING (true)` for role `anon`.
- No change to `profiles` policies or grants.
- Also confirm the other public-schema tables have the standard `authenticated` / `service_role` grants so dashboards keep working.

Frontend (`src/pages/BrowseItems.tsx`):

- Fetch vendor names from `profiles` only when a session exists; otherwise skip that query and hide the vendor line.
- Replace `.single()` on `delivery_config` with `.maybeSingle()` and keep the existing default of 50 when no row is returned.
