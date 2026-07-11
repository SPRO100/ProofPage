# ProofPage — Design System

## Principles

1. **Clarity over decoration** — every element earns its place.
2. **Trust signals are first-class** — verified badges must be visually distinct and never ambiguous.
3. **Bilingual by default** — layouts work in both English and Russian without reflow.
4. **Mobile-first** — the public profile is the most visited page; it must be excellent on a phone.

## Component library

shadcn/ui on top of Tailwind CSS. Customise tokens; do not fork components unless unavoidable.

## Colour tokens (base theme)

```css
--background:   #ffffff / #0a0a0a   (light / dark)
--foreground:   #0a0a0a / #fafafa
--card:         #f9f9f9 / #111111
--border:       #e5e5e5 / #262626
--accent:       #18181b / #fafafa
--verified:     #16a34a              /* green — revenue verified */
--unverified:   #9ca3af              /* grey — manual / unverified */
--error:        #dc2626              /* red — stale or broken connection */
--pro:          #7c3aed              /* purple — Pro badge */
```

## Typography

- Font: `Geist` (system fallback: `system-ui, sans-serif`)
- Scale: Tailwind defaults (text-sm through text-4xl)
- Headings: `font-semibold`
- Body: `font-normal`
- Mono (revenue figures): `font-mono font-medium`

## Public profile layout

### Desktop (≥ 768 px)
```
┌─────────────────┬────────────────────────────┐
│  Avatar         │  Project card              │
│  Name           │  Project card              │
│  Location       │  Project card              │
│  Bio            │                            │
│  Revenue total  │                            │
│  Social links   │                            │
│  Plan badge     │                            │
└─────────────────┴────────────────────────────┘
```

### Mobile (< 768 px)
Stacked: avatar → name → bio → revenue → social → projects

## Verification badge variants

| State | Colour | Label (EN) | Label (RU) |
|-------|--------|------------|------------|
| Verified | `--verified` green | Revenue Verified · Stripe | Выручка подтверждена · Stripe |
| Stale | amber | Last synced 2d ago | Последняя синхр. 2 дня назад |
| Error | `--error` red | Connection error | Ошибка подключения |
| Unverified | `--unverified` grey | Unverified | Не подтверждено |

## ProofPage branding (free plan)

A small "Powered by ProofPage" link in the footer. Removed on Pro. Must be visible but not obtrusive.

## Language toggle

Minimal pill in the top-right corner of every page: `EN | RU`. Active language is bold.

## Animation

- Page transitions: `opacity` fade, 150 ms
- Language selection screen: fade in logo → fade in buttons, 200 ms stagger
- Card hover: subtle `scale(1.01)` + shadow lift, 120 ms ease-out
- No animations for users who prefer `prefers-reduced-motion`

## Responsive breakpoints

Follow Tailwind defaults: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280
