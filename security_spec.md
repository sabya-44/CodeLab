# Firestore Security Specification — CodeFix Lab

## 1. Data Invariants
1. **Strict Ownership**: Only an authenticated, email-verified user (`request.auth.uid == userId && request.auth.token.email_verified == true`) can read or write `/users/{userId}` or `/users/{userId}/progress/{challengeId}`.
2. **Parent Existence (Master Gate)**: A `progress` document under `/users/{userId}/progress/{challengeId}` can only be created when the parent `/users/{userId}` profile exists.
3. **Immutable Identity & Timestamps**: `uid`, `userId`, `challengeId`, and `createdAt` can never be changed after document creation. `createdAt` on create and `updatedAt` on create/update must equal `request.time`.
4. **Monotonic Completion**: Once a `ChallengeProgress` document reaches `status == 'solved'`, subsequent updates cannot downgrade `status` back to `'attempted'`.
5. **Bounded Payloads**: `savedHtml` and `savedJs` are capped at 20,000 chars, `studyNote` at 2,000 chars, `displayName` at 100 chars, and IDs must match `^[a-zA-Z0-9_\-]+$` within 128 chars.

## 2. Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated read of `/users/u1` -> `PERMISSION_DENIED`
2. Cross-user read of `/users/u2/progress/c1` by `u1` -> `PERMISSION_DENIED`
3. Unverified email write (`email_verified: false`) -> `PERMISSION_DENIED`
4. Shadow field injection (`isAdmin: true`) on profile create -> `PERMISSION_DENIED`
5. Shadow field injection (`extraScore: 999`) on progress update -> `PERMISSION_DENIED`
6. Spoofed `userId` (`userId: "u2"`) inside `/users/u1/progress/c1` -> `PERMISSION_DENIED`
7. Client-forged `createdAt` timestamp not equal to `request.time` -> `PERMISSION_DENIED`
8. Mutating `createdAt` or `challengeId` on update -> `PERMISSION_DENIED`
9. Downgrading `status` from `'solved'` back to `'attempted'` -> `PERMISSION_DENIED`
10. Oversized `savedJs` (> 20,000 chars) DoS payload -> `PERMISSION_DENIED`
11. Invalid `challengeId` path with traversal/spaces (`"../../etc"`) -> `PERMISSION_DENIED`
12. Blanket collection `list` on `/users` -> `PERMISSION_DENIED`
