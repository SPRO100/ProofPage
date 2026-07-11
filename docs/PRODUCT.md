# ProofPage — Product Definition

## Promise

One public page that proves what an indie founder builds and, when connected, what their projects earn. Verified revenue separates real builders from those with unconfirmed numbers.

## Positioning

ProofPage is the credibility layer for indie founders. It is not a social network, a SaaS dashboard, or a portfolio builder. It is a public proof page. ProofPage is a standalone product — it has no integration with ProofMRR or any shared infrastructure in the MVP.

## Language

First-time visitors see a minimal language selection screen: **English | Русский**. The choice is saved in localStorage and remains switchable in the navigation. The public profile is shown in the visitor's language if the founder has filled in both translations.

## Plans

### Free
- One profile, one project
- Base theme with ProofPage branding
- Social links
- Manual revenue entry — always labelled **Unverified**
- Basic view count

### Pro
- Multiple projects
- Additional themes
- Read-only revenue provider connections
- **Revenue Verified** badge with source, period, and last sync timestamp
- Revenue charts and history
- Advanced analytics
- Custom domain (future)
- No ProofPage branding

## Trust model

Manual revenue is never verified — this is enforced on the server, not just in the UI. Verified revenue requires an active read-only connection to a supported provider. If a connection fails or goes stale, the public badge changes to reflect the degraded state automatically. ProofPage never writes to any revenue provider.

## Explicitly out of scope for MVP

- ProofMRR integration or shared infrastructure
- Public catalog of all projects
- Global or RU leaderboard
- Revenue rankings
- Marketplace
- Background ranking jobs
- Public API or MCP
- Social feed or comments
- Team accounts
