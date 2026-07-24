---
name: Clinical Pro
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434653'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737784'
  outline-variant: '#c3c6d5'
  surface-tint: '#1d59c1'
  primary: '#003c90'
  on-primary: '#ffffff'
  primary-container: '#0f52ba'
  on-primary-container: '#bcceff'
  inverse-primary: '#b0c6ff'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#732900'
  on-tertiary: '#ffffff'
  tertiary-container: '#993900'
  on-tertiary-container: '#ffc0a7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b0c6ff'
  on-primary-fixed: '#001945'
  on-primary-fixed-variant: '#00419c'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  data-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  headline-md-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.3'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style

The brand personality is authoritative, sterile, and hyper-efficient, tailored specifically for the B2B medical procurement sector. It targets healthcare professionals, pharmacy owners, and hospital administrators who require a reliable tool rather than a shopping experience.

The design style is **Minimalist-Functional**. It prioritizes information density and clarity over decorative flair. The interface employs heavy whitespace to reduce cognitive load when navigating complex technical inventories. Visual hierarchy is established through precise typography and subtle tonal shifts rather than high-contrast colors, ensuring the UI remains unobtrusive during long periods of professional use.

## Colors

The palette is centered on "Clinical Blue," a deep, professional primary shade that evokes trust and institutional stability. 

- **Primary (#0F52BA):** Used for primary actions, navigation states, and branding elements.
- **Secondary/Success (#14B8A6):** A medical teal used for safety indicators, availability status, and health-related accents.
- **Backgrounds:** A tiered system of cool grays. The base canvas is `#F8FAFC`, with white (`#FFFFFF`) reserved for surface cards to create a subtle separation.
- **Supportive Colors:** Warnings are handled with a soft amber; aggressive reds are strictly avoided. Denials or "Out of Stock" states utilize a neutral gray-scale to maintain a calm, professional atmosphere.

## Typography

This design system utilizes **Inter** as the primary typeface for its exceptional legibility and neutral, systematic appearance. For technical specifications such as SKUs, Strength, and Pack Counts, **JetBrains Mono** is used sparingly as a secondary utility font to provide a distinct visual "grid" feel to alphanumeric data.

- **Headlines:** Use Semi-bold weights to define clear sections.
- **Body:** Standardized at 16px for readability, with a 14px variant for denser data tables.
- **Technical Labels:** Small-caps or monospaced font styles should be used for SKU strings to differentiate them from marketing descriptions.

## Layout & Spacing

The system follows a **Fixed Grid** layout for desktop (12 columns) to ensure consistency in data-heavy views, transitioning to a fluid single-column layout for mobile. 

A strict 8px spacing scale is enforced to maintain alignment. 
- **Large gaps (24px+):** Used between distinct product categories or section blocks.
- **Tight gaps (4px-8px):** Used within component groups, such as a label and its corresponding input field.
- **Data Density:** In table views, horizontal padding is prioritized over vertical padding to allow more rows to be visible above the fold.

## Elevation & Depth

To maintain a "clean room" aesthetic, depth is communicated through **low-contrast outlines** and **tonal layering** rather than heavy shadows.

- **Level 0 (Base):** `#F8FAFC` background.
- **Level 1 (Cards):** White background with a 1px border in `#E2E8F0`.
- **Level 2 (Hover/Active):** A very soft, diffused shadow (0px 4px 12px rgba(15, 82, 186, 0.05)) is used to indicate interactivity on product cards.
- **Modals:** Use a semi-transparent white backdrop blur (Glassmorphism) to keep the user oriented within the product catalog while focusing on a specific action.

## Shapes

The shape language is "Rounded," utilizing an 8px base radius for most components. This softens the clinical nature of the product without appearing overly "bubbly" or consumer-grade.

- **Standard (8px):** Buttons, Input fields, and Product Cards.
- **Large (16px):** Main container areas and Modals.
- **Small (4px):** Checkboxes and Status Tags.

## Components

### Buttons & Call-to-Action
The primary button uses the "Clinical Blue" fill. The **'Order on WhatsApp'** action is a specialized component: it uses a secondary teal outline with the WhatsApp icon, ensuring it is prominent but visually distinct from the standard 'Add to Cart' or 'View Details' actions.

### Data Tables
Tables are the core of the B2B experience. They feature sticky headers, zebra-striping (using `#F1F5F9`), and dedicated columns for technical data. Technical data like "Strength" should be emphasized with a slightly heavier weight.

### Product Cards
Cards are minimalist. They exclude price tags (per B2B requirements) and focus on:
1. Manufacturer Name (Small, Neutral)
2. Product Title (Bold, Primary)
3. SKU/Technical Specs (Monospaced Utility Font)
4. Availability Status (Teal Badge)

### Input Fields
Forms use high-visibility focus states with a 2px primary blue border. Labels are always persistent (no floating labels) to ensure clarity during fast-paced data entry.

### Chips & Status
Status indicators for "In Stock" or "FDA Approved" use a soft Teal background with dark Teal text. "Discontinued" or "Backordered" items use neutral grays.