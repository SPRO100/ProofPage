# ProofPage — Design System

## Principles

1. **Clarity over decoration** — every element earns its place.
2. **Trust signals are first-class** — verified badges must be visually distinct and unambiguous.
3. **Bilingual by default** — layouts work in English and Russian without reflow or truncation.
4. **Mobile-first** — the public profile is the most-visited page; it must be excellent on a phone.

## Component library

shadcn/ui on top of Tailwind CSS 4. Customise design tokens; do not fork components unless unavoidable.

## Colour tokens

```css
/* Light / Dark */
--background:   #ffffff / #0a0a0a
--foreground:   #0a0a0a / #fafafa
--card:         #f9f9f9 / #111111
--border:       #e5e5e5 / #262626
--accent:       #18181b / #fafafa

/* Semantic — same in both themes */
--verified:     #16a34a   /* green  — revenue verified */
--unverified:   #9ca3af   /* grey   — manual / no connection */
--stale:        #d97706   /* amber  — sync overdue */
--error:        #dc2626   /* red    — connection broken */
--pro:          #7c3aed   /* purple — Pro badge */
```

## Typography

- Font: `Geist` (fallback: `system-ui, sans-serif`)
- Scale: Tailwind defaults (`text-sm` → `text-4xl`)
- Headings: `font-semibold`
- Body: `font-normal`
- Revenue figures: `font-mono font-medium`

## Public profile layout

### Desktop (≥ 768 px) — two-column
```
┌──────────────────┬─────────────────────────────┐
│  Avatar          │  Project card               │
│  Name            │  Project card               │
│  Location        │  Project card               │
│  Bio             │                             │
│  Total revenue   │                             │
│  Social links    │                             │
│  Plan badge      │                             │
└──────────────────┴─────────────────────────────┘
```

### Mobile (< 768 px) — stacked
Avatar → Name → Bio → Revenue → Social → Projects

## Verification badge variants

| State | Colour token | Label (EN) | Label (RU) |
|-------|-------------|------------|------------|
| Verified | `--verified` | Revenue Verified · Stripe | Выручка подтверждена · Stripe |
| Stale | `--stale` | Synced 2 days ago | Обновлено 2 дня назад |
| Error | `--error` | Connection error | Ошибка подключения |
| Unverified | `--unverified` | Unverified | Не подтверждено |

## ProofPage branding (free plan)

A small "Powered by ProofPage" link in the profile footer. Removed for Pro accounts. Must be visible but not obtrusive — `text-xs` muted.

## Language toggle

Minimal pill in the top-right navigation: `EN | RU`. Active language is `font-semibold`.

## Animation

- Page transitions: `opacity` fade, 150 ms ease-in-out
- Language screen: logo fade → buttons fade, 200 ms stagger
- Card hover: `scale(1.01)` + shadow lift, 120 ms ease-out
- Respect `prefers-reduced-motion` — no animations when set

## Responsive breakpoints

Tailwind defaults: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280
