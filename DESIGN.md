---
name: ore Infrastructure Console
description: Visual infrastructure design and deployment for AWS, with emphasis on clarity and safety
colors:
  primary-accent: "#2563eb"
  primary-accent-hover: "#1d4ed8"
  primary-accent-muted: "#3b82f6"
  status-error: "#f87171"
  status-success: "#4ade80"
  status-warning: "#facc15"
  status-info: "#60a5fa"
  module-vpc: "#2563eb"
  module-ecs: "#ea580c"
  module-rds: "#16a34a"
  module-alb: "#0891b2"
  module-monitoring: "#7c3aed"
  module-secondary: "#ec4899"
  module-tertiary: "#14b8a6"
  neutral-bg-primary: "#111827"
  neutral-bg-secondary: "#1f2937"
  neutral-bg-tertiary: "#374151"
  neutral-border: "#4b5563"
  neutral-text-primary: "#f3f4f6"
  neutral-text-secondary: "#d1d5db"
  neutral-text-tertiary: "#9ca3af"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1.875rem, 5vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.1
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
  mono:
    fontFamily: "'Monaco', 'Courier New', monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "4px"
  md: "8px"
spacing:
  xs: "2px"
  sm: "4px"
  md: "8px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary-accent}"
    textColor: "{colors.neutral-text-primary}"
    padding: "8px 16px"
    rounded: "{rounded.md}"
  button-primary-hover:
    backgroundColor: "{colors.primary-accent-hover}"
  button-secondary:
    backgroundColor: "{colors.neutral-bg-tertiary}"
    textColor: "{colors.neutral-text-primary}"
    padding: "8px 16px"
    rounded: "{rounded.md}"
  button-secondary-hover:
    backgroundColor: "{colors.neutral-text-tertiary}"
  input-field:
    backgroundColor: "{colors.neutral-bg-tertiary}"
    textColor: "{colors.neutral-text-primary}"
    padding: "8px 12px"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.neutral-bg-secondary}"
    rounded: "{rounded.md}"
    padding: "24px"
  card-border:
    backgroundColor: "{colors.neutral-bg-secondary}"
    textColor: "{colors.neutral-text-primary}"
    rounded: "{rounded.md}"
---

# Design System: ore Infrastructure Console

## 1. Overview

**Creative North Star: "The Architect's Workspace"**

ore's interface is a blueprint-focused design system inspired by how architects work: clear line weights, intentional hierarchy, visible relationships between components, and a restrained tonal palette that emphasizes information over decoration. Infrastructure engineers using ore should feel like they're designing something precise and intentional—each module placement, each configuration change, each deployment carries weight and is visible on the canvas.

The system deliberately rejects **SaaS dashboard clichés (hero metrics, gradient overlays, card grids), gaming UI (neon effects, skeuomorphic depth), and terminal envy (trying to look like a CLI when a GUI is better)**. Instead, it provides a space where the infrastructure—not the interface—is the focus.

**Key Characteristics:**
- **Methodical and precise** — Every element has visual intent; nothing is decorative
- **Information-first hierarchy** — Current state (environment, cost, deployment status) precedes actions (Plan, Apply, Destroy buttons)
- **Visual relationships matter** — Module dependencies are shown via connectors; proximity and grouping convey infrastructure relationships
- **Trustworthy under pressure** — Error messages are actionable; destructive operations require confirmation; success/progress is always visible
- **Instant feedback** — No hidden loading states; SSE streaming shows exactly what's happening in real time

---

## 2. Colors: Hierarchical & Infrastructure-Aware

The palette uses a **hierarchical color strategy** where module colors express relationships. VPC (the foundation) receives the bold primary blue; dependent modules (ECS, RDS, ALB) use muted, desaturated hues to visually indicate dependency. Status colors (success/error/warning) use standard semantic tones, never confused with module identity.

### Primary
- **Decision Blue** (`#2563eb`): The core infrastructure foundation (VPC module). Also used for primary actions (buttons, focus states), links, and information-level output (terraform plan info).
- **Decision Blue Hover** (`#1d4ed8`): Interactive state for primary accent elements (button hover, link active).

### Modules (Hierarchical)
- **VPC Foundation** (`#2563eb`): Primary infrastructure layer. Bold, confident blue. Parents all other modules in the dependency tree.
- **ECS Container** (`#ea580c`): Muted orange. Application deployment layer.
- **RDS Database** (`#16a34a`): Muted green. Data layer.
- **ALB Load Balancer** (`#0891b2`): Muted cyan. Network distribution layer.
- **Monitoring & Observability** (`#7c3aed`): Muted purple. Cross-cutting concerns.
- **Secondary Services** (`#ec4899`): Muted pink. Auxiliary modules (Secrets, IAM, CloudFront, Budgets, Client VPN, SSM).
- **Tertiary Services** (`#14b8a6`): Muted teal. Reserved for future extensions.

### Status & Feedback
- **Error State** (`#f87171`): Bright red. Terminal failures, validation errors, destructive confirmations. Never used for module identity.
- **Success State** (`#4ade80`): Bright green. Deployment completed, configuration saved, infrastructure ready.
- **Warning State** (`#facc15`): Bright yellow. Pending operations, in-progress deployments, deprecation notices.
- **Info State** (`#60a5fa`): Bright blue. Informational messages, terraform plan details.

### Neutral Foundation
- **Background Primary** (`#111827`): Page and canvas background. Maximum contrast for content readability.
- **Background Secondary** (`#1f2937`): Card, panel, and input backgrounds. Subtle depth without visual noise.
- **Background Tertiary** (`#374151`): Hover states, secondary backgrounds, disabled states.
- **Border** (`#4b5563`): Dividers, input borders, container edges. Subtle and restrained.
- **Text Primary** (`#f3f4f6`): Primary body text, headings. Maximum contrast on dark backgrounds.
- **Text Secondary** (`#d1d5db`): Secondary labels, timestamps, helper text.
- **Text Tertiary** (`#9ca3af`): Disabled states, low-emphasis text, placeholders.

**The Hierarchy Rule:** VPC always receives the primary accent color. All dependent modules receive desaturated, toned versions. This creates visual subordination: a glance at the canvas shows the infrastructure topology just from module color intensity. Status colors (red, green, yellow, blue) never overlap with module colors, so a red error message can't be confused with a pink module.

---

## 3. Typography

**System Font:** System default (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, Roboto, sans-serif)  
**Monospace Font:** `Monaco` or `Courier New` (for terminal output, code blocks, values)

**Character:** The typography system uses a single sans-serif family with disciplined weight and size hierarchy. Large sizes are reserved for page titles; body copy stays readable at 0.875rem (14px). Monospace appears only in Terminal output and code contexts, never mixed with body text.

### Hierarchy
- **Display** (2.25rem, 700 weight): Page titles ("ore"). Rare; only used on login and top-level pages.
- **Headline** (1.125rem, 600 weight): Component and section titles ("Infrastructure Status", "Configuration Panel"). Used sparingly to separate major regions.
- **Title** (1rem, 600 weight): Module names, card titles, form group headings.
- **Body** (0.875rem, 400 weight): Form labels, helper text, descriptions. Default text throughout. Line length capped at 65–75ch for comfort.
- **Label** (0.75rem, 500 weight): Secondary metadata, timestamps, status tags, form hints.
- **Mono** (0.75rem, 400 weight): Terminal output, values, code references. Never antialiased; allows pixel-perfect legibility at small sizes.

---

## 4. Elevation & Spatial Depth

**Philosophy:** ore uses **tonal layering, not shadow depth**. The interface is fundamentally flat, with depth communicated through background color and stroke weight, not blur and drop shadows. This keeps the focus on information and relationships, not decorative layering.

### Layering Strategy
- **Base layer** (Background Primary, `#111827`): Canvas, page background. Darkest, most recessive.
- **Content layer** (Background Secondary, `#1f2937`): Cards, panels, input fields. Slightly lighter. Communicates containment via color difference, not shadow.
- **Emphasis layer** (Border accent): Important sections and cards use a subtle 1px border in the primary accent color or neutral border. Borders signal structure and grouping without visual weight.
- **Interactive layer** (Hover states): Button and input hover states shift Background Tertiary (`#374151`). Never uses blur or shadow; only color and transition.

**Interactive Feedback:** All state changes (hover, focus, active) use **color shifts and 200ms ease-out transitions**. No spring animations, no bouncing, no backdrop blur. A button hover shifts background color smoothly. A focused input gets a 1px accent border. This feels responsive without being kinetic.

---

## 5. Components

Components are minimal and functional. They prioritize clarity over visual embellishment.

### Buttons
- **Shape:** Slightly rounded (8px radius) to soften hard edges without softness that obscures intent.
- **Primary Button:** Bold background (Decision Blue, `#2563eb`), white text, 8px vertical / 16px horizontal padding. Hover to darker blue (`#1d4ed8`) with instant 200ms transition.
- **Secondary Button:** Subtle background (Background Tertiary, `#374151`), neutral text. Hover to Text Tertiary (`#9ca3af`). Used for cancel, close, or lower-priority actions.
- **States:** Disabled buttons (attempting save with validation errors) use gray background and muted text, no transition. Success/error buttons (after deploy) flash green or red text briefly, then fade.

### Forms & Inputs
- **Style:** Dark background (`#374151`), light gray border (`#4b5563`), white text. Small (0.875rem). Padding 8px left/right, 8px top/bottom.
- **Focus:** Border shifts to primary accent blue (`#2563eb`). No box-shadow, no glow. Clean and precise.
- **Validation:** Errors appear as red text below the field (0.75rem, `#f87171`), not as field border color change. This keeps visual focus on the message, not the field.
- **Types:** All inputs use the same base styling. Type (`text`, `number`, `email`, `password`, `checkbox`) is implicit in the label and placeholder, not via border or background styling.

### Cards & Containers
- **Style:** Tonal background (`#1f2937`), 1px subtle border (`#4b5563` or accent color for important cards), 8px border radius, 24px internal padding.
- **Titles:** Use Headline weight (1.125rem, 600) in neutral text primary. No separate card header section; title flows with content.
- **Borders:** Important cards (ConfigPanel, Terminal, MonitorDash components) get a 1px accent border to signal containment and importance. Generic cards use the subtle neutral border.

### Canvas & Modules
- **Module Shape:** 48px × 48px squares with 4px radius (soften, don't round aggressively).
- **Module Color:** Follows hierarchy rule (VPC bold, dependents muted). Labels in white, 0.75rem, centered below icon.
- **Dependencies:** Dashed lines (SVG strokes, 1px, 30% opacity) connecting modules. No arrowheads; direction implied by source→target flow. Rarely should more than 4 lines cross a module (indication of over-complexity).

### Terminal / Output Panel
- **Background:** Darkest (Background Primary, `#111827`), 1px subtle border, monospace font (0.75rem).
- **Output Lines:** Each line colored by content type (green for success, red for error, yellow for warning, blue for info, gray default). Uses inline `<span class="text-{color}-{shade}">` classes for semantic meaning.
- **Progress:** Yellow "Running..." indicator (1.5rem, animated spinner) during execution. Upon completion, "✓ Command succeeded" in green fades in. Upon error, "✗ Command failed" in red with error context.

### Navigation & Sidebars
- **Background:** Background Secondary (`#1f2937`).
- **Active item:** Accent color background (Decision Blue, `#2563eb`), white text, 8px padding.
- **Hover item:** Background Tertiary (`#374151`), text secondary color, smooth transition.
- **Dividers:** 1px subtle border; never full-width bars.

---

## 6. Do's and Don'ts

### Do:
- **Do** use the primary accent color (`#2563eb`) sparingly and intentionally. The "one voice" rule: accent appears on ≤10% of any canvas (typically the VPC module and one primary CTA button). Its rarity is the point.
- **Do** express module relationships through color hierarchy: VPC bold, dependents desaturated. A user should see the dependency tree just by looking at color intensity.
- **Do** show infrastructure state before offering actions. Current environment, cost estimate, deployment status come before Plan/Apply/Destroy buttons.
- **Do** use tonal layering (background color shifts) instead of shadows. Depth is communicated via color, not blur.
- **Do** validate early and show errors inline (red text below fields). Don't prevent form submission with "disabled" buttons; instead, show a clear error message and let users try to save.
- **Do** stream terraform output in real time (SSE). Never buffer or hide progress. Live output builds trust.
- **Do** require explicit confirmation for destructive operations (destroy, delete). Flash red, ask twice, then execute.
- **Do** use consistent spacing (8px grid). Stick to the scale (8, 16, 24, 32px for padding; 4, 8px for minor tweaks).

### Don't:
- **Don't** use side-stripe borders (border-left or border-right > 1px) as colored accents on cards or alerts. This is ore's anti-pattern: rewrite with full borders, background tints, or icon leading.
- **Don't** use gradients (background or text). Status and hierarchy come from solid colors and weight, not blending.
- **Don't** use glassmorphism, backdrop blur, or drop shadows as default effects. Flat and tonal only.
- **Don't** mix status colors with module colors. If a module is red, it's a state (error/alert), not a module type.
- **Don't** decorate inputs with icons unless the icon is functional (a show/hide password toggle). Duplicate icons and labels create visual noise.
- **Don't** use animations for layout changes (don't animate CSS grid, flexbox, or position properties). Animate color, opacity, and transform only.
- **Don't** hide errors behind loading spinners. Use SSE streaming to show real progress and real failures.
- **Don't** add rounded corners to everything. Use 4–8px radius for softness; go higher only for large containers (cards, modals).
- **Don't** SaaS-ify the interface: no hero metrics, no gradient overlays, no identical card grids. This is a technical tool, not a marketing site.
- **Don't** try to look like a CLI when a GUI is better. The terminal exists for viewing real terraform output; the GUI shows infrastructure visually.

---

**Last Updated:** May 24, 2026  
**Design Epoch:** 1 (Core UX + Stability)  
**Next Epoch:** 2 (Enhanced dependency visualization, cost-aware color coding)
