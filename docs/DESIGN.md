# ProofPage — Visual System

ProofPage should feel like a founder's working notebook made credible: warm, direct, spacious, and evidence-led. The visual language is playful enough to feel human, but every proof state must remain precise. The product must never resemble a crypto dashboard, a generic landing template, or a social network.

## Principles

1. **Proof over promises** — project context, provenance, sync time, and verification state carry the hierarchy.
2. **Warm utility** — paper surfaces, simple geometry, and restrained hand-drawn accents make serious data approachable.
3. **One accent per zone** — coral identifies the single key idea or action; it is not a general decoration colour.
4. **Verification is earned** — mint is reserved for real verification, successful actions, availability, and explicit status.
5. **Bilingual by construction** — every component must survive longer Russian copy without truncation or a different hierarchy.
6. **Mobile proof first** — public profiles and project cards must be complete and readable on a phone.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| `--canvas` | `#F2F2F2` | Universal warm page background |
| `--paper` | `#FFFFFF` | Cards, forms, navigation, elevated surfaces |
| `--ink` | `#151B31` | Primary text, primary actions, dark proof moments |
| `--coral` | `#FF5858` | One headline phrase, key CTA, or focused annotation per zone |
| `--mint` | `#86E0C1` | Verified, success, live/available, and status only |
| `--butter` | `#FEDF89` | Planned features, warm highlights, notes, and neutral chart areas |
| `--graphite` | `#333333` | Secondary strong text and icon strokes |
| `--slate` | `#6D6F75` | Body copy, captions, helper text |
| `--stone` | `#E8E7E5` | Borders and warm shadow reference |
| `--danger` | `#B4232F` | Destructive actions and errors only |

Rules:

- Never use mint to imply that Free includes provider verification.
- Manual and demo values use neutral canvas/stone treatment and explicit `Unverified` or `Demo` labels.
- Pro cards may use butter for planned availability, but their disabled CTA must remain visibly disabled.
- Do not introduce purple, neon pink, glass surfaces, gradients, or cold black shadows.

## Typography

- UI and body: **Inter**, weights 400–800, `letter-spacing: -0.01em`.
- Display: **Rubik Mono One** as the open chunky hand-printed face with native Latin and Cyrillic coverage.
- Display type is limited to hero headlines, page openers, public-profile names, section statements, and short doodle annotations.
- Buttons, inputs, badges, navigation, tables, and long text always use Inter.
- Revenue and metric figures use Inter with tabular browser numerals where alignment matters; they do not need a separate crypto-style mono font.

Recommended scale:

| Role | Desktop | Mobile | Line height |
| --- | --- | --- | --- |
| Hero display | 64–102px | 48–75px | `.98–1.03` |
| Page display | 42–74px | 38–56px | `1.03` |
| Section display | 42–76px | 38–59px | `1.06` |
| Card title | 18–26px | 18–24px | `1.2` |
| Body | 16–18px | 15–16px | `1.55–1.65` |
| UI/caption | 11–14px | 11–14px | `1.4–1.55` |

## Shape, spacing, and elevation

- Base spacing unit: `4px`.
- Common gaps: `8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 100px`.
- Page max width: `1200px`.
- Standard section spacing: `76px` mobile, `100px` desktop.
- Buttons, inputs, selects, badges, compact controls: `8px` radius.
- Standard cards and form panels: `16px` radius.
- Large feature, auth, onboarding, and public founder cards: `24px` radius.
- Circles are reserved for identity marks, presence dots, and the ProofPage mark—not general buttons.
- Card shadow: `0 1px 4px rgba(138, 133, 125, .2)`.
- Hero/auth lift: `0 16px 42px rgba(138, 133, 125, .16)`.
- No glass blur, layered glow, large cold shadow, or gradient fill.

Prefer parent padding plus `gap`. Do not repair component spacing with arbitrary child margins.

## Components

### Primary action

Ink background, white label, 8px radius, 46–48px height. Coral replaces ink only for the single conversion action in a zone.

### Secondary action

Paper background, stone border, ink label, no decorative shadow. Hover may lift by 2px.

### Status and provenance

| State | Surface | Required content |
| --- | --- | --- |
| Verified | Mint | `Revenue verified`, provider, period/value, last sync |
| Stale | Butter | Last successful sync and stale explanation |
| Error | Pale red / danger | Failure state and recovery action |
| Manual | Canvas/stone | `Owner entered · Unverified` |
| Demo | Canvas/stone | `Demonstration data` |
| Planned Pro | Butter or neutral | `Coming soon` and disabled honest CTA |

### Fields

Paper surface, stone border, 8px radius, 48px height. Focus uses an ink border with a subtle ink ring. Error changes only the border/helper text; success may use mint.

### Doodles

Use small code-native SVG arrows, underlines, stars, or short hand-printed notes. Doodles support explanation and direction; they never replace labels or become background noise. A section should have no more than one doodle cluster.

## Landing and hero

- Lead with the ProofPage promise: show the work, prove the numbers, build trust.
- Use one coral phrase within the display headline.
- Show a product-native proof widget, not a generic screenshot collage.
- The hero widget must include a project, revenue amount, provider/source context, last sync, and mint verified badge.
- The original ProofPage robot astronaut may peek from behind the widget. Its hands, feet, or body must not cover controls or data.
- Never imply that the hero's connected verification is part of Free; pricing and onboarding must state that read-only verified sources are Pro/planned while security flags are disabled.
- CTA order: create ProofPage first, proof-profile example second.

## Dashboard

- Desktop uses a white 264px sidebar on the canvas; mobile uses a white header plus horizontally scrollable route navigation.
- Page title establishes the task. The first card contains the next useful action or health state.
- Forms and managers use white 16px cards; dark ink cards are reserved for one upgrade/proof moment.
- Disabled billing or connection actions must explain why and must not open checkout.
- Empty, loading, error, success, and recovery states use the same card primitives; errors always include a next action when one exists.

## Public proof profile

- It is a proof profile, not a marketing landing page.
- Desktop: sticky founder proof card plus project evidence column.
- Mobile: founder identity, provenance summary, links, then project cards.
- Each project card groups identity, owner-written context, primary metric, provenance state, chart/history, and timestamp.
- Total verified revenue receives mint treatment only when at least one project has a real verified revenue state.
- Private preview uses a butter owner banner and is accessible only after owner authentication; the public route still filters public profiles/projects.
- Free profiles retain unobtrusive `Built with ProofPage` branding.

## Motion

- Hover/focus transitions: `120–150ms`, functional only.
- Page/language reveal: opacity up to `200ms`; no long stagger sequence.
- Buttons/cards may move up at most `2px`.
- Avoid looping, parallax, bounce, glow pulse, and decorative chart animation.
- `prefers-reduced-motion: reduce` disables non-essential transitions and smooth scrolling.

## Visual QA checklist

- [ ] English and Russian render without clipped labels, forced one-line headings, or broken card heights.
- [ ] Landing reviewed at 1440px, 1024px, 390px, and 320px.
- [ ] Auth and all four onboarding steps reviewed on desktop and mobile.
- [ ] Dashboard navigation remains reachable on mobile without a non-functional menu button.
- [ ] Profile, projects, metric history, revenue, and billing retain their actions and disabled states.
- [ ] Public profile reviewed with zero projects, manual metrics, verified revenue, missing avatar/bio, and long Russian copy.
- [ ] Owner preview shows drafts only to the authenticated owner.
- [ ] Mint appears only for verified/success/status meanings.
- [ ] Every visual zone contains no more than one coral focal accent.
- [ ] No gradients, glass blur, purple neon, copied mascot, copied logo, or copied Tracky text/assets.
- [ ] Keyboard focus is visible; colour contrast and 44px touch targets are preserved.
- [ ] `prefers-reduced-motion` is respected.
