# Design System Documentation

This theme includes a comprehensive design system that is fully customizable through the Shopify Theme Editor. All design tokens are stored as CSS variables and can be referenced throughout your codebase.

## Table of Contents

- [Design Tokens](#design-tokens)
- [CSS Variables](#css-variables)
- [Utility Classes](#utility-classes)
- [Usage Examples](#usage-examples)
- [Customization](#customization)

## Design Tokens

All design tokens are customizable in **Theme Settings** → **Customize theme** → **Theme settings**.

### Typography

**Settings Location:** Theme Settings → Typography

- **Primary Font**: Main font family for the theme
- **Base Font Size**: Base size for body text (default: 16px)
- **Font Scale Ratio**: Ratio for heading sizes (default: 1.25)
- **Body Line Height**: Line height for body text (default: 1.6)
- **Heading Line Height**: Line height for headings (default: 1.2)

**Available CSS Variables:**
```css
--font-primary--family
--font-size-xs, --font-size-sm, --font-size-base, --font-size-lg, --font-size-xl, --font-size-2xl, --font-size-3xl
--line-height-body
--line-height-heading
```

### Colors

**Settings Location:** Theme Settings → Colors

**Base Colors:**
- Background Color
- Foreground Color

**Primary Colors:**
- Primary Color (main brand color)
- Primary Text Color

**Secondary Colors:**
- Secondary Color
- Secondary Text Color

**Accent Colors:**
- Accent Color
- Success Color
- Warning Color
- Error Color

**Border Colors:**
- Border Color
- Divider Color

**Available CSS Variables:**
```css
--color-background
--color-foreground
--color-primary
--color-primary-text
--color-secondary
--color-secondary-text
--color-accent
--color-success
--color-warning
--color-error
--color-border
--color-divider
```

### Spacing

**Settings Location:** Theme Settings → Layout → Spacing Scale

- **Base Spacing Unit**: Base unit for spacing scale (default: 8px)

**Available CSS Variables:**
```css
--spacing-xs    /* 0.25x base */
--spacing-sm    /* 0.5x base */
--spacing-md    /* 1x base */
--spacing-lg    /* 2x base */
--spacing-xl    /* 3x base */
--spacing-2xl   /* 4x base */
--spacing-3xl   /* 6x base */
```

### Buttons

**Settings Location:** Theme Settings → Buttons

- Border Radius (default: 8px)
- Vertical Padding (default: 12px)
- Horizontal Padding (default: 24px)
- Border Width (default: 0px)
- Button Style (Solid, Outline, Ghost)

**Available CSS Variables:**
```css
--button-border-radius
--button-padding-vertical
--button-padding-horizontal
--button-padding
--button-border-width
--button-style
```

### Cards

**Settings Location:** Theme Settings → Cards

- Border Radius (default: 12px)
- Padding (default: 24px)
- Border Width (default: 1px)
- Shadow Enabled (default: true)
- Shadow Opacity (default: 10%)

**Available CSS Variables:**
```css
--card-border-radius
--card-padding
--card-border-width
--card-shadow-enabled
--card-shadow-opacity
```

### Forms & Inputs

**Settings Location:** Theme Settings → Forms & Inputs

- Border Radius (default: 4px)
- Vertical Padding (default: 12px)
- Horizontal Padding (default: 16px)
- Border Width (default: 1px)

**Available CSS Variables:**
```css
--input-border-radius
--input-padding-vertical
--input-padding-horizontal
--input-padding
--input-border-width
```

### Shadows

**Settings Location:** Theme Settings → Shadows

- Blur Radius (default: 10px)
- Spread (default: 0px)
- Horizontal Offset (default: 0px)
- Vertical Offset (default: 2px)

**Available CSS Variables:**
```css
--shadow-blur
--shadow-spread
--shadow-offset-x
--shadow-offset-y
--shadow-color
--shadow
```

### Transitions

**Settings Location:** Theme Settings → Transitions

- Duration (default: 200ms)
- Easing (Ease, Ease In, Ease Out, Ease In Out, Linear)

**Available CSS Variables:**
```css
--transition-duration
--transition-easing
--transition
```

## CSS Variables

All design tokens are available as CSS variables in the `:root` scope. You can reference them anywhere in your stylesheets:

```css
.my-component {
  background-color: var(--color-primary);
  color: var(--color-primary-text);
  padding: var(--spacing-lg);
  border-radius: var(--card-border-radius);
  box-shadow: var(--shadow);
  transition: var(--transition);
}
```

## Utility Classes

The design system includes utility classes prefixed with `ds-` (design system). Include the utilities by rendering the snippet:

```liquid
{% render 'design-system-utils' %}
```

### Typography Utilities

```html
<h1 class="ds-heading-1">Heading 1</h1>
<h2 class="ds-heading-2">Heading 2</h2>
<p class="ds-body">Body text</p>
<span class="ds-text-xs">Extra small text</span>
<span class="ds-text-sm">Small text</span>
<span class="ds-text-lg">Large text</span>
```

### Color Utilities

```html
<div class="ds-bg-primary">Primary background</div>
<div class="ds-bg-secondary">Secondary background</div>
<span class="ds-text-primary">Primary text</span>
<span class="ds-text-accent">Accent text</span>
```

### Spacing Utilities

```html
<div class="ds-p-lg">Large padding</div>
<div class="ds-m-xl">Extra large margin</div>
<div class="ds-pt-md">Medium top padding</div>
<div class="ds-mb-lg">Large bottom margin</div>
```

### Button Utilities

```html
<button class="ds-button ds-button--primary">Primary Button</button>
<button class="ds-button ds-button--secondary">Secondary Button</button>
<button class="ds-button ds-button--outline">Outline Button</button>
<button class="ds-button ds-button--ghost">Ghost Button</button>
```

### Card Utilities

```html
<div class="ds-card">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

### Input Utilities

```html
<input type="text" class="ds-input" placeholder="Enter text">
<textarea class="ds-input"></textarea>
```

### Border Utilities

```html
<div class="ds-border ds-rounded">Rounded border</div>
<div class="ds-border-t">Top border</div>
<div class="ds-border-b">Bottom border</div>
```

### Shadow Utilities

```html
<div class="ds-shadow">Default shadow</div>
<div class="ds-shadow-sm">Small shadow</div>
<div class="ds-shadow-lg">Large shadow</div>
```

## Usage Examples

### Example 1: Custom Component Using CSS Variables

```liquid
<div class="custom-feature">
  <h2 class="custom-feature__title">Feature Title</h2>
  <p class="custom-feature__description">Feature description</p>
  <button class="custom-feature__button">Learn More</button>
</div>

{% stylesheet %}
  .custom-feature {
    background-color: var(--color-background);
    padding: var(--spacing-xl);
    border-radius: var(--card-border-radius);
    border: var(--card-border-width) solid var(--color-border);
  }
  
  .custom-feature__title {
    font-size: var(--font-size-2xl);
    color: var(--color-primary);
    margin-bottom: var(--spacing-md);
  }
  
  .custom-feature__description {
    font-size: var(--font-size-base);
    line-height: var(--line-height-body);
    color: var(--color-foreground);
    margin-bottom: var(--spacing-lg);
  }
  
  .custom-feature__button {
    padding: var(--button-padding);
    background-color: var(--color-primary);
    color: var(--color-primary-text);
    border-radius: var(--button-border-radius);
    transition: var(--transition);
  }
  
  .custom-feature__button:hover {
    opacity: 0.9;
  }
{% endstylesheet %}
```

### Example 2: Using Utility Classes

```liquid
<div class="ds-card ds-p-xl ds-mb-lg">
  <h2 class="ds-heading-2 ds-text-primary ds-mb-md">Card Title</h2>
  <p class="ds-body ds-text-foreground ds-mb-lg">Card description text</p>
  <button class="ds-button ds-button--primary">Action</button>
</div>
```

### Example 3: Responsive Design with Design System

```liquid
<div class="responsive-grid">
  {% for item in items %}
    <div class="responsive-grid__item ds-card">
      <h3 class="ds-heading-3">{{ item.title }}</h3>
    </div>
  {% endfor %}
</div>

{% stylesheet %}
  .responsive-grid {
    display: grid;
    gap: var(--spacing-lg);
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  .responsive-grid__item {
    transition: var(--transition);
  }
  
  .responsive-grid__item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
{% endstylesheet %}
```

## Customization

All design system values can be customized through the Shopify Theme Editor:

1. Go to **Online Store** → **Themes** → **Customize**
2. Click **Theme settings** in the bottom left
3. Navigate through the sections:
   - **Typography**: Font settings and sizes
   - **Colors**: All color tokens
   - **Layout**: Page width, margins, spacing
   - **Buttons**: Button styles
   - **Cards**: Card styles
   - **Forms & Inputs**: Input styles
   - **Shadows**: Shadow styles
   - **Transitions**: Animation settings

Changes are saved automatically and apply across the entire theme.

## Best Practices

1. **Always use CSS variables** instead of hardcoded values
2. **Use utility classes** for common patterns to maintain consistency
3. **Reference design tokens** in your custom stylesheets
4. **Test changes** in the theme editor to see real-time updates
5. **Document custom components** that extend the design system

## Reference

For a complete list of available CSS variables, check `snippets/css-variables.liquid`.

For utility classes, check `snippets/design-system-utils.liquid`.

