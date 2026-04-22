---
name: svg-diagrams
description: Create rich, polished SVG diagrams for technical documentation — architecture layers, data flow diagrams, routing flows, capability matrices, and system overviews. Use when documentation needs inline visuals that render natively in GitBooks, GitHub, or any markdown-based platform.
origin: Verifast
---

# SVG Diagrams

Produce structured, design-quality SVG diagrams that replace ASCII art, Mermaid placeholders, and generic diagram-tool exports.

## When to Activate

- An architecture, integration, or system overview page needs a visual
- A routing or data flow has more than 4 steps and reads better as a diagram than a table
- A comparison or capability matrix benefits from visual encoding (color, grouping, icons)
- The user explicitly requests a diagram, visual, or chart for documentation
- Replacing existing ASCII or Mermaid diagrams with production-quality visuals

## Non-Negotiables

1. **SVG is the default** — not Mermaid, not ASCII, not an external diagram tool link.
2. **Self-contained** — every SVG file stands alone with inline styles and no external dependencies.
3. **Readable at default scale** — minimum font size 10px; labels must be legible without zooming.
4. **No text overflow** — measure available width before writing long text strings.
5. **Committed to the repo** — SVG files live in an `assets/` directory beside the `.md` file that references them.

## Design System

### Color Palette

Use these consistent values across all Verifast documentation diagrams:

| Role | Color | Hex |
|------|-------|-----|
| Background | Light gray-blue | `#F0F4F8` or `#EEF2F7` |
| Layer / box — deepest | Dark navy | `#0F2137` |
| Layer / box — deep | Dark blue | `#163B6A` |
| Layer / box — mid | Medium blue | `#1462A0` |
| Layer / box — light | Bright blue | `#1F7EC4` |
| Accent stripe | Sky blue | `#4DB8FF` |
| Arrow / connector | Sky blue | `#4DB8FF` or `#94A3B8` |
| Security / middleware | Deep purple | `#4C1D95` |
| Service / success | Dark green | `#14532D` |
| Resolver / decision | Amber | `#78350F` |
| Listener / event | Teal | `#0F4A45` |
| External / CRM | Violet | `#3B0764` |
| Label text on dark | White | `#FFFFFF` |
| Secondary text on dark | Light blue-gray | `#93BFDE` or `#94A3B8` |
| Muted text on dark | Slate | `#64748B` |
| Badge label | Sky blue | `#93C5FD` |

### Typography

```
font-family: "'Segoe UI', Arial, sans-serif"
```

| Use | Size | Weight |
|-----|------|--------|
| Page title | 17px | 700 |
| Subtitle / caption | 11–12px | 400 |
| Box title | 13–14px | 700 |
| Body text in box | 10.5–11px | 400 |
| Badge label | 9–10px | 700 |

### Spacing

- Box padding: text starts ~15px from left edge of content (after accent stripe)
- Accent stripe width: 7px on left edge of each major box
- Corner radius on boxes: 6–10px (`rx`)
- Gap between stacked boxes: 14–20px
- Arrow length: 18–26px between boxes

### Drop Shadow

Apply to major boxes for depth:

```xml
<filter id="shadow" x="-2%" y="-2%" width="104%" height="112%">
  <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#00000018"/>
</filter>
```

Use `filter="url(#shadow)"` on `<rect>` elements.

### Arrowheads

Define reusable markers in `<defs>`:

```xml
<marker id="arrowDown" markerWidth="10" markerHeight="8" refX="5" refY="8" orient="auto">
  <polygon points="0,0 10,0 5,8" fill="#94A3B8"/>
</marker>
```

---

## Diagram Patterns

### Architecture Layer Stack

Use for: layered system architecture, abstraction levels, SDK/adapter patterns.

**Layout:** vertical stack of colored rectangles, top-to-bottom from highest to lowest abstraction. Dashed connector arrows between layers. Left accent stripe per box. Badge pill showing layer number.

**Canvas:** 820 × 510
**Box dimensions:** 770px wide × 84px tall, starting at x=25
**Layer spacing:** 14px gap with 20px arrow

**Box structure per layer:**
```xml
<rect x="25" y="{y}" width="770" height="84" rx="7" fill="{color}" filter="url(#shadow)"/>
<rect x="25" y="{y}" width="7" height="84" rx="3.5" fill="#4DB8FF"/>
<!-- badge pill -->
<rect x="46" y="{y+16}" width="66" height="19" rx="9.5" fill="#4DB8FF" opacity="0.25"/>
<text x="79" y="{y+29}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#93C5FD">LAYER N</text>
<!-- title -->
<text x="128" y="{y+28}" font-size="13.5" font-weight="700" fill="#FFFFFF">Layer Title</text>
<!-- subtitle -->
<text x="128" y="{y+45}" font-size="11" fill="#93BFDE">package · component · component</text>
<!-- description -->
<text x="128" y="{y+62}" font-size="10.5" fill="#64748B">One line of explanatory detail</text>
```

**Layer y positions (top to bottom):** 68, 178, 288, 398

---

### Touch Point / System Flow

Use for: integration overviews showing communication between multiple systems.

**Layout:** horizontal arrangement of system boxes (PMS left, platform center, external service right). Directional arrows with number badges and labels. Color-coded by direction.

**Canvas:** 900 × 420
**Arrow colors by direction:**
- Inbound (external → platform): `#2D7DD2` (blue)
- Outbound results (platform → external): `#16A34A` (green)
- Outbound CRM (platform → CRM): `#7C3AED` (purple)

**System box structure:**
```xml
<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="#0F2137" filter="url(#shadow)"/>
<!-- header band -->
<rect x="{x}" y="{y}" width="{w}" height="42" rx="10" fill="#163B6A"/>
<rect x="{x}" y="{y+28}" width="{w}" height="14" fill="#163B6A"/>
<text x="{cx}" y="{y+21}" text-anchor="middle" font-size="13" font-weight="700" fill="#FFFFFF">System Name</text>
```

---

### Step-by-Step Routing Flow

Use for: request routing chains, webhook processing pipelines, service call sequences.

**Layout:** vertical stack of 7 or fewer steps, each a colored box with a component-type badge. Dashed connector arrows between steps. Step number shown faintly on the right edge of each box.

**Canvas:** 700 × 650
**Box dimensions:** 620px wide × 58px tall, starting at x=40
**Step spacing:** 15px gap with 20px arrow

**Color coding by component type:**

| Component | Background | Accent stripe | Badge text |
|-----------|-----------|---------------|------------|
| HTTP layer | `#0F2137` | `#38BDF8` | `#7DD3FC` |
| Middleware / Security | `#4C1D95` | `#A78BFA` | `#C4B5FD` |
| SDK call | `#163B6A` | `#4DB8FF` | `#7DD3FC` |
| Event listener | `#0F4A45` | `#2DD4BF` | `#5EEAD4` |
| Handler | `#163B6A` | `#4DB8FF` | `#7DD3FC` |
| Resolver / router | `#78350F` | `#FCD34D` | `#FDE68A` |
| Service / terminal | `#14532D` | `#4ADE80` | `#86EFAC` |

**Step box structure:**
```xml
<rect x="40" y="{y}" width="620" height="58" rx="6" fill="{bg}" filter="url(#shadow)"/>
<rect x="40" y="{y}" width="7" height="58" rx="3.5" fill="{stripe}"/>
<!-- badge -->
<rect x="58" y="{y+12}" width="80" height="17" rx="8.5" fill="{stripe}" opacity="0.2"/>
<text x="98" y="{y+24.5}" text-anchor="middle" font-size="9" font-weight="700" fill="{badge}" letter-spacing="0.6">TYPE</text>
<!-- title -->
<text x="155" y="{y+24}" font-size="12.5" font-weight="700" fill="#FFFFFF">Component Name</text>
<!-- description -->
<text x="155" y="{y+42}" font-size="10.5" fill="#64748B">What this step does</text>
<!-- step number (faint) -->
<text x="648" y="{y+36}" font-size="22" font-weight="900" fill="#FFFFFF" opacity="0.08">N</text>
```

**Step y positions (7 steps):** 72, 145, 218, 291, 364, 437, 510

---

## File Conventions

- **Location:** `assets/` subdirectory relative to the `.md` file
- **Naming:** `{page-slug}-{diagram-type}.svg`
  - `pms-architecture-layers.svg`
  - `pms-touch-points.svg`
  - `pms-webhook-flow.svg`
- **Reference in markdown:** `![Descriptive alt text](assets/filename.svg)`
- **One diagram per concept** — do not combine unrelated flows into a single SVG

## When NOT to Use SVG

- Simple 3-node inline concept where a sentence suffices
- A table already communicates the information more clearly
- The user explicitly requests Mermaid or ASCII

## Visual Inspection Before Publishing

SVG does not wrap text automatically. Every text element must be manually measured before the file is committed. Failing to do this produces invisible overflow — the text renders outside its box and is silently cropped or bleeds into adjacent elements.

### Step 1 — Measure before writing long strings

Calculate the safe character limit for any text line before writing it:

```
available_width  = box_width - text_x_offset - right_margin(~15px)
chars_per_pixel  ≈ 5.0px at font-size 10 · 5.5px at font-size 10.5 · 6.0px at font-size 11 · 6.5px at font-size 12.5
safe_char_limit  = available_width ÷ chars_per_pixel
```

Example: box width 860px, text starts at x=180, font-size 10 → available = 860 − 180 − 15 = 665px → limit ≈ 133 chars.

If your string exceeds the limit, **split it into multiple `<text>` elements** at incremental y positions (add ~15px per additional line).

### Step 2 — Adjust box height after adding lines

When a box needs an extra text line:
1. Increase the `height` attribute on the parent `<rect>` by the line spacing (14–16px per extra line).
2. Shift every element below that box down by the same amount — connectors, arrows, labels, and all subsequent boxes.
3. Update the root `<svg height>` and the full-canvas background `<rect height>` to match the new total.

### Step 3 — Open in a browser before committing

Open the SVG file locally (`file:///...`) in Chrome or Firefox and visually scan:
- No text running past the right edge of its box
- No text clipped at the bottom of a box
- Connector arrows still point to the correct positions after any height changes
- All step numbers and badge labels are visible

### Common overflow patterns to watch

| Situation | Symptom | Fix |
|---|---|---|
| Many method names on one line | Text bleeds outside box | Split onto 2–3 lines, increase box height |
| Provider field paths like `payload.balances.iso_currency_code` | Long dotted paths overflow | Abbreviate to `balances.iso_currency_code` or split |
| Comma-separated class lists | 5+ class names overflow | Use `·` separator and wrap after 3–4 names |
| Box height unchanged after adding a line | Bottom line clips | Always add 14–16px to box height per extra line |

---

## Quality Gate

Before committing:
- [ ] Every text line measured against safe_char_limit for its font size and box width
- [ ] Box heights increased for any boxes where text lines were added
- [ ] All downstream element y-positions updated after any height changes
- [ ] Canvas `<svg height>` and background `<rect height>` match the total diagram height
- [ ] File opened in a browser — no visible text overflow or clipping
- [ ] All text fits within its bounding box at the declared canvas size
- [ ] Font sizes are 10px or larger
- [ ] No external URLs or `<image>` references with remote `href`
- [ ] Colors match the design system palette
- [ ] File is referenced correctly in the `.md` with a relative path
- [ ] File is committed to the repo alongside the markdown

## Related Skills

- `frontend-design` for UI component and page-level visual systems
- `article-writing` for structuring technical documentation content
