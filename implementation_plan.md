# Universal Proxy-User Location-Aware Intent Switcher

Implement a dynamic, location-aware visa intent flow that auto-detects the user's country via IP geolocation and presents a premium "For Myself / For Someone Else" branching UI. The flow should work for any country worldwide, not just India.

## Current Flow

```
ServiceSelection → click "Visa Services" → /visa-start (VisaStart.jsx)
  → user picks passport country from static list of 13
    → /visa-services (VisaServices.jsx)
      → queries Supabase CountryList table by PassportCountry
        → shows VisaCountries destinations
          → /visa-application (VisaApplication.jsx)
```

## Proposed Changes

### Geo-Location Hook

#### [NEW] [useGeoLocation.js](file:///c:/Users/manvi/OneDrive/Documents/SlotPilot/src/hooks/useGeoLocation.js)

A React hook that:
1. Calls the free `https://ip-api.com/json/` endpoint on mount
2. Returns `{ country, countryCode, loading, error }`
3. Caches the result in `sessionStorage` under key `"slotpilot_geo"` so repeat navigations don't re-fetch
4. Falls back to `null` country on error (the UI will handle that gracefully)

---

### Rewrite VisaStart Page

#### [MODIFY] [VisaStart.jsx](file:///c:/Users/manvi/OneDrive/Documents/SlotPilot/src/pages/VisaStart.jsx)

**Major rewrite** — this page becomes the dynamic intent switcher:

**Phase 1 — Detection screen** (brief loading shimmer):
- Show a premium animated "Detecting your location…" state while the `useGeoLocation` hook resolves

**Phase 2 — Intent question** (once country is detected):
- Display: *"We see you're in **[Detected Country]** 🇺🇸. Are you looking for visas for yourself, or assisting someone in another country?"*
- Two large, animated option cards:
  - **"For Myself"** — icon: user silhouette, subtle glow
  - **"For Someone Else"** — icon: globe/users, subtle glow

**Phase 3a — "For Myself" chosen:**
- Store `{ contextCountry: detectedCountry, mode: "self" }` in `sessionStorage` under key `"slotpilot_visa_context"`
- Navigate to `/visa-services` with `state: { passportCountry: detectedCountry }`

**Phase 3b — "For Someone Else" chosen:**
- Smooth in-card transition to a **"Select Applicant's Location"** view
- Show a searchable grid of "Top Countries" (same static list from current `COUNTRIES` + extend to ~25 popular ones) plus a search input
- On selection: store `{ contextCountry: selectedCountry, mode: "proxy" }` in `sessionStorage`
- Navigate to `/visa-services` with `state: { passportCountry: selectedCountry }`

**Fallback**: If geo-detection fails, skip Phase 2 and go directly to the "Select Applicant's Location" (Phase 3b) UI.

---

### Update VisaServices Page

#### [MODIFY] [VisaServices.jsx](file:///c:/Users/manvi/OneDrive/Documents/SlotPilot/src/pages/VisaServices.jsx)

Minimal changes:
- On mount, also read `sessionStorage.getItem("slotpilot_visa_context")` as a fallback if `location.state.passportCountry` is missing (handles page refreshes / direct URL access)
- Everything else (Supabase query, country cards, filtering) stays exactly the same

---

### Update VisaApplication Page

#### [MODIFY] [VisaApplication.jsx](file:///c:/Users/manvi/OneDrive/Documents/SlotPilot/src/pages/VisaApplication.jsx)

Minimal change:
- Read `sessionStorage.getItem("slotpilot_visa_context")` as fallback for [country](file:///c:/Users/manvi/OneDrive/Documents/SlotPilot/src/pages/VisaServices.jsx#83-89) when `location.state` is empty (handles refresh scenarios)

---

## UI / UX Design Notes

- **Geo loading state**: Skeleton shimmer with pulsing globe icon, max ~2 seconds
- **Intent cards**: Glassmorphic cards with gradient borders, hover scale, and micro-animations (framer-motion)
- **Transition**: AnimatePresence for smooth fade/slide between phases
- **Country picker**: Searchable input + grid of flag+name cards, same design language as existing [VisaServices](file:///c:/Users/manvi/OneDrive/Documents/SlotPilot/src/pages/VisaServices.jsx#73-752) cards
- **Dark mode**: Fully supported, matching existing design tokens
- **Session key format**: `{ contextCountry: "United States", countryCode: "US", mode: "self"|"proxy" }`

## Verification Plan

### Browser Tests
Since there are no existing unit tests in the project, verification will be done visually using the browser:

1. **Geo-detection flow**: Run `npm run dev`, open `http://localhost:5173/visa-start`, verify the location detection shows the correct country and the intent question appears
2. **"For Myself" path**: Click "For Myself", verify it navigates to `/visa-services` with the detected country passed through, and that `sessionStorage` has the correct `slotpilot_visa_context`
3. **"For Someone Else" path**: Click "For Someone Else", verify the country picker appears with search, select a country, verify navigation to `/visa-services`
4. **Fallback (geo-fail)**: Temporarily break the API URL, verify the page degrades gracefully to the country picker
5. **SessionStorage persistence**: Navigate to `/visa-services` then refresh the page — verify the country is recovered from sessionStorage
6. **Dark mode**: Toggle dark mode on landing page, navigate to `/visa-start`, verify all states render correctly

### Manual Verification (User)
- Visit the site from a real device — does the detected country match your actual location?
- Try the full flow end-to-end: landing page → Visa Services card → intent question → visa services → select destination → visa application form
