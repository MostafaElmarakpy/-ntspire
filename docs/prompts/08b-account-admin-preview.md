# Phase 08b — Mock account, profile & admin preview (NOT real auth)

Read first: 00-global-rules.md; spec §50 (role concept only, not real auth), §26
(admin modules list, for scope reference only); master prompt §11, §23.

## Goal
A fully mock, local-only "signed in" experience and a read-mostly Admin preview,
so the product can be demoed end-to-end — with ZERO real authentication, ZERO
backend, and no misleading claim of real functionality anywhere in the UI or copy.

## Hard constraint (read before coding)
This is NOT real auth. There is no OAuth, no Google API call, no server session,
no password storage of any kind. "Continue with Google" and "Continue with email"
buttons only simulate a signed-in state in localStorage. This must never be
described to the user as real sign-in anywhere in the UI, code comments, or
reports — call it a "mock session" / "preview account" internally.

## In scope
- P8b-01 `AuthService` interface + `MockAuthService` (localStorage): a single
  mock session object (id, display name, handle, role: "user" | "admin",
  avatar — generated, not a real photo), `signIn()`, `signOut()`,
  `getSession()`. No real credentials are ever collected or sent anywhere.
- P8b-02 Sign-in UI (dialog or `/[locale]/sign-in` page): split layout —
  value-prop copy + CTA on one side, a visual preview collage of mock section
  cards on the other (reuse Phase 4 cards, no new asset system). Primary
  "Continue with Google" button (styled like a real OAuth button, Google "G"
  mark included) that — on click — simply creates the mock session locally
  after a short simulated delay; a secondary email input + "Continue" that
  does the same. No real validation beyond basic format. Replaces the current
  Phase 03 "auth arrives with backend" dialog as the Sign in entry point.
- P8b-03 `/[locale]/profile` page: avatar, display name, role badge, handle,
  "member since" (mock date), Edit profile (updates the local mock session
  only), and a grid of the user's own Saves/Collections from Phase 08 below
  the header. Sign out control.
- P8b-04 Promote one mock session to `role: "admin"` by default in dev mode
  (documented clearly as a mock convenience, not a security model).
- P8b-05 `/[locale]/admin` (visible only when the mock session role is
  "admin"; otherwise redirects home) — clearly labeled in the UI as "Preview
  — not connected to a backend". Read-mostly screens over the EXISTING mock
  fixtures from Phase 02, with edits (where present) saved to a local
  overlay, never mutating the base fixtures:
  - Sources / Pages / Sections browser (list + basic metadata view)
  - Tag / Category / taxonomy browser (read-only — taxonomy stays config-driven)
  - User list (static mock list, not real users)
  - Analytics overview reading from the Phase 1 mock analytics buffer
  - A "Submission queue" screen is OUT OF SCOPE — it depends on the real
    backend capture worker (spec §26/§31) and must not be faked here. Add a
    single empty-state card explaining it arrives with the backend, and note
    it in NEXT_STEPS.md.
- P8b-06 Nav/user-menu updated: Sign in → opens P8b-02; once "signed in",
  user menu shows avatar, Profile, (Admin, if admin role), Sign out.
- P8b-07 Update ARCHITECTURE.md (mock-auth boundary, what changes when real
  auth/admin arrive) and NEXT_STEPS.md (real OAuth + real admin are backend
  phases, not touched here).

## Out of scope
Any real OAuth flow, any password storage, any real admin mutation of
submissions/captures, multi-user accounts, permissions beyond the single
mock role flag.

## Required tests
Mock session create/clear/persist across reload, role-gated `/admin` redirect
for non-admin sessions, profile edit persists, sign-in dialog keyboard/escape
behavior, e2e: sign in → profile shows session → visit /admin as admin vs as
non-admin → sign out clears session; clean console; axe clean.

## Exit
Global gate + report, explicitly confirming no real network/auth calls exist
anywhere in the new code (grep for fetch/OAuth usage and show the result is empty
