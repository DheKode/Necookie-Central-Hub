# Necookie Central Hub Brand System

## 1. Brand Philosophy
Necookie Central Hub is a personal life operating system: one place to plan, reflect, track, and understand your daily life. The interface should feel like a quiet command center where complexity is organized into clear, actionable views.

Design intent:
- Clarity over decoration
- Focus over noise
- Intelligence over novelty
- Personal utility over corporate polish

## 2. Product Personality
Core traits:
- Calm
- Intelligent
- Focused
- Minimal
- Slightly futuristic
- Personal

Tone in UI copy:
- Brief and direct
- Helpful, not chatty
- Confident, not robotic
- Human, not playful

## 3. Visual Identity
Visual direction:
- Dark-mode first, with parity in light mode
- Layered surfaces with soft depth
- Subtle gradients used as accents, not backgrounds
- Rounded corners with disciplined radii
- High information density without visual clutter

Shape language:
- `rounded-xl` for cards and panels
- `rounded-lg` for controls
- `rounded-md` for dense utility elements

Depth model:
- Base background
- Elevated surface cards
- Interactive overlays (modals, dropdowns, sheets)
- Soft shadow + border separation (avoid heavy blur and neumorphism)

## 4. Color System
Use semantic tokens so components stay stable if palette changes.

### Core Tokens (Dark-First)
- Primary: `#7C9BFF`
- Secondary: `#93A3B8`
- Accent: `#4FE0B5`
- Background: `#0B1020`
- Surface: `#121A2E`
- Surface Elevated: `#17223B`
- Border: `#263352`
- Text Primary: `#E6ECFF`
- Text Secondary: `#9BA9C7`
- Success: `#2BCB7F`
- Warning: `#F3B94E`
- Error: `#F06A7A`

### Tailwind-Compatible Tokens
```js
// tailwind.config.js (example)
theme: {
  extend: {
    colors: {
      nc: {
        primary: '#7C9BFF',
        secondary: '#93A3B8',
        accent: '#4FE0B5',
        bg: '#0B1020',
        surface: '#121A2E',
        surfaceElevated: '#17223B',
        border: '#263352',
        text: '#E6ECFF',
        muted: '#9BA9C7',
        success: '#2BCB7F',
        warning: '#F3B94E',
        error: '#F06A7A'
      }
    }
  }
}
```

Usage guidance:
- Reserve `nc.primary` for key actions and selected states.
- Use `nc.accent` sparingly for highlights and AI moments.
- Keep chart palettes distinct from action colors.

## 5. Typography System
Typography should prioritize dense dashboard readability and predictable rhythm.

Recommended stack:
- Headings/UI: `Sora`, `Manrope`, `Inter`, `system-ui`, `sans-serif`
- Body/Data: `Inter`, `system-ui`, `sans-serif`
- Numeric emphasis: `JetBrains Mono`, `IBM Plex Mono`, `monospace`

Type scale:
- H1: 32/40, 700
- H2: 24/32, 650
- H3: 20/28, 650
- Body: 15/24, 450
- Small: 13/20, 450
- UI Label: 12/16, 600, +0.02em

Rules:
- Use tabular numbers for finance and analytics values.
- Limit line length to 60-80 characters in text-heavy screens.
- Keep heading hierarchy shallow in dashboards.

## 6. Spacing and Layout System
Use an 8pt base scale with 4pt micro-steps for dense components.

Spacing scale:
- 4, 8, 12, 16, 24, 32, 40, 48, 64

Web grid:
- Desktop: 12-column grid
- Tablet: 8-column grid
- Mobile web: 4-column grid

Container widths:
- Content max: 1280px
- Wide analytics mode: 1440px
- Reading views (Journal): 760px

Card layout rules:
- Default card padding: 16-20px
- Card gap: 12-16px
- Header-to-content spacing: 12px
- Avoid more than 3 nested visual containers

Widget behavior:
- Cards are modular and reorderable where appropriate.
- Preserve consistent card heights in row layouts for scanability.
- Use progressive disclosure for secondary metrics.

## 7. UI Component Style Guidelines
Buttons:
- Heights: 32 / 40 / 48
- Primary: filled `nc.primary`, subtle hover lift
- Secondary: surface fill + border
- Ghost: transparent with clear hover state
- Destructive: `nc.error` with explicit confirmation patterns

Cards:
- `rounded-xl`, `border nc.border`, `bg nc.surface`
- Optional glass treatment: low-opacity top gradient + 8-12px blur behind overlays only

Inputs:
- High contrast text and placeholder
- Focus ring: 2px `nc.primary` at 40-60% opacity
- Validation colors should include icon + text, not color alone

Modals:
- Use for focused tasks only
- Width tiers: sm 420px, md 560px, lg 720px
- Backdrop: dark tint with subtle blur

Tabs:
- Underline or soft-pill style, consistent per module
- Keep max 5 primary tabs per context

Sidebar navigation:
- Persistent on desktop
- Group by module: Dashboard, Todo, Finance, Journal, History, Vault, AI Summary
- Active item has shape + color change, not color alone

Mobile tab navigation:
- 4-5 tabs max, thumb-friendly
- Center tab can emphasize Dashboard

Dropdowns:
- 8px vertical padding, clear hover/selected state
- Min width 200px for label readability

Toasts:
- Bottom-right desktop, top mobile
- 4-6 second default duration
- Include concise status title and optional action

Tables:
- Dense but breathable row height (40-44px)
- Sticky headers for long lists
- Use zebra tint only when it improves legibility

Charts:
- Prioritize readability over decoration
- Keep grid lines low-contrast
- Use tooltip and legend formatting consistent with typography tokens

## 8. Dashboard Layout Principles
Dashboard is a modular tile-based control center.

Structure:
- Top row: daily snapshot + quick actions
- Middle rows: productivity, finance, habits/metrics
- Lower area: timeline and AI recap previews

Principles:
- Show status at a glance, details on interaction
- Keep important metrics above the fold
- Avoid full-width single cards unless narrative requires it
- Support personalization without breaking baseline structure

## 9. Mobile Design Guidelines
Mobile should mirror identity, not copy desktop density.

Adaptation rules:
- Prioritize single-column flow
- Use stacked cards with clear section dividers
- Place key actions in thumb zones
- Prefer bottom sheets for quick actions and filters
- Keep forms split into short steps

Consistency:
- Reuse token names and component semantics from web
- Maintain identical color intent and status signaling
- Keep iconography and motion behavior aligned

## 10. Motion and Micro-Interactions
Motion is subtle, fast, and informative.

Timing:
- Hover: 120-160ms
- Tap/press feedback: 80-120ms
- Panel/modal transitions: 180-240ms
- Route transitions: 180-220ms

Patterns:
- Use opacity + translate (4-8px) for entrances
- Avoid elastic or bounce easing in core productivity flows
- Loading states should use skeletons for structured content
- AI generation state should show progress language + gentle pulse

## 11. Iconography
Primary icon set: Lucide Icons.

Rules:
- 16px for dense controls, 20px default, 24px emphasis
- 1.75-2px stroke consistency
- Pair icons with labels in first-use contexts
- Do not rely on icon-only critical actions without tooltip or label

## 12. Data Visualization Style
Charts must support fast pattern recognition.

Guidelines:
- Use a restrained 5-7 color categorical palette
- Keep one highlight series and muted comparison series
- Prefer line/area for trends, bars for comparisons, donut sparingly
- Always include units (`$`, `%`, `hrs`, etc.)
- Support empty and low-data states with useful prompts

Recharts implementation notes:
- Centralize chart theme config
- Standardize tooltip card component across modules
- Use `ResponsiveContainer` defaults aligned with card paddings

## 13. Accessibility Guidelines
Baseline targets:
- WCAG 2.2 AA contrast for text and controls
- Keyboard navigable web UI
- Minimum touch target 44x44 on mobile
- Visible focus states on all interactive elements

Practices:
- Never communicate state by color alone
- Use semantic HTML and ARIA roles where needed
- Provide reduced-motion alternatives
- Announce async/AI status updates to assistive tech

## 14. Design Principles for AI Features
AI features should feel assistive, transparent, and non-intrusive.

Principles:
- Explain what AI generated and from which data scope
- Distinguish AI output from user-authored content
- Allow quick edit, dismiss, and regenerate actions
- Keep AI UI in context (cards, summaries, side panels), not dominant
- Provide trust cues: timestamp, confidence language, fallback states

Tone for AI responses:
- Practical and concise
- Suggestive, not prescriptive
- Respectful of user agency

## 15. Developer Implementation Notes
Cross-platform design system strategy:
- Define shared design tokens in TypeScript (color, spacing, radius, type scale, motion)
- Export web mappings for Tailwind and CSS variables
- Export mobile mappings for React Native style objects

Implementation checklist:
- Keep a single source of truth for semantic tokens
- Build primitive components first: `Button`, `Card`, `Text`, `Input`, `Surface`
- Add module-specific composites after primitives stabilize
- Document do/don't examples in Storybook (web) and Expo preview screens (mobile)
- Add visual regression checks for core screens

Suggested token files:
- `shared/design/tokens.ts`
- `client/src/styles/tokens.css`
- `client/tailwind.config.ts`
- `mobile/src/theme/tokens.ts`

Definition of done for new UI:
- Uses semantic tokens only
- Meets accessibility baseline
- Matches motion and interaction standards
- Supports loading, empty, error, and success states
- Verified on desktop and mobile breakpoints
