# Full Super Admin Dashboard

The Super Admin area currently has only 7 screens (Dashboard, States & Districts, Panchayaths, Areas, Commission, Admin Accounts, Settings) and no login protection. This plan adds the missing oversight features so Super Admin can see and control everything on the platform.

## 1. Protect the Super Admin area

Right now anyone who opens /superadmin sees the dashboard — there is no session or role check in the page. Add the same guard the Admin dashboard uses: verify the logged-in session holds the `super_admin` role, otherwise sign out and redirect to the Super Admin login.

## 2. New sections in the sidebar

- **Users** — one place listing every user with their role (Super Admin, Admin, Vendor, Customer, Delivery), name, mobile, and area/panchayath. Filter by role, search by name/mobile, and change or remove a user's role.
- **Orders** — platform-wide order list: order number, customer, vendor, item, amount, payment method, status, date. Filter by status and area, plus search.
- **Items** — all listings across every area with vendor, category, price, status (pending/active/inactive/rejected), and the ability to approve, reject, or deactivate.
- **Payments & Settlements** — payments list with method/status, and pending settlements per user with a "Mark settled" action, plus totals.
- **Wards** — read-only view of wards grouped under each panchayath (wards are generated automatically from ward count).

## 3. Richer dashboard home

Keep the existing counters and add:

- Revenue tiles: total order value, total platform commission, total delivery charges, pending settlement amount.
- Orders-by-status breakdown.
- Recent orders list and recent registrations (pending vendor/admin/delivery applications) with quick links to the approval screens.
- Pending-approval count badges in the sidebar so nothing waits unnoticed.

## 4. Settings page

Settings currently holds only the fixed delivery charge. Keep that and add platform totals plus a shortcut to category/commission management.

## Technical notes

- New page components under `src/pages/superadmin/`: `SAUsers.tsx`, `SAOrders.tsx`, `SAItems.tsx`, `SAPayments.tsx`, `SAWards.tsx`; registered in the `renderContent` switch and the `navItems` / `pageTitles` maps in `SuperAdminDashboard.tsx`.
- Auth guard added in `SuperAdminDashboard.tsx` mirroring `AdminDashboard.tsx` (session check + `user_roles` lookup for `super_admin`).
- No schema changes expected; data comes from existing tables (`orders`, `items`, `payments`, `settlements`, `profiles`, `user_roles`, `wards`, `vendor_applications`). "Vendor" in the UI keeps the `owner` terminology in the database, and profile names are looked up manually since there are no foreign keys to `profiles`.
- If any of these reads turn out to be blocked by row-level access rules for the super_admin role, a follow-up migration will add the matching read policies — verified against live data before writing it.