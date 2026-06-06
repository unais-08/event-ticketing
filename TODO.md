# TODO

- [x] Implement organizer-only header component (replaced empty `orgranizer-header.tsx`).
- [x] Hide public `SiteHeader` on organizer routes (`/organizer/*`) in `frontend/app/_components/layout/layout-wrapper.tsx`.
- [x] Add `frontend/app/(organizer)/organizer/layout.tsx` that renders organizer header and gates it with `RoleGuard allowedRoles={['ORGANIZER']}`.
- [ ] Run frontend lint/build and verify header visibility on:
  - [ ] `/organizer/dashboard`
  - [ ] `/organizer/events`
  - [ ] `/organizer/events/new`
  - [ ] `/organizer/check-in` (and ensure public header is hidden)

