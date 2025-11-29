# Component Library Documentation

## Overview

This component library provides 50+ reusable components organized by category. Each component is available as:

- **Snippets**: Reusable Liquid components for developers
- **Theme Blocks**: Editor-customizable components for merchants
- **Design System Integration**: All components use CSS variables from the design system

## Component Categories

### Actions
Components for user interactions and navigation.

- **Button** (`component-actions-button`) - Triggers actions or events
- **Button Group** (`component-actions-button-group`) - Displays multiple buttons together
- **Link** (`component-actions-link`) - Makes text interactive for navigation
- **Menu** (`component-actions-menu`) - Displays a list of actions
- **Clickable** (`component-actions-clickable`) - Generic interactive container
- **Clickable Chip** (`component-actions-clickable-chip`) - Interactive button for categorization

### Forms
Components for collecting user input.

- **TextField** (`component-forms-text-field`) - Single-line text input
- **TextArea** (`component-forms-textarea`) - Multi-line text input
- **Select** (`component-forms-select`) - Dropdown selection
- **Checkbox** (`component-forms-checkbox`) - Binary selection
- **Switch** (`component-forms-switch`) - Toggle switch
- **EmailField** (`component-forms-email-field`) - Email input
- **NumberField** (`component-forms-number-field`) - Number input
- **PasswordField** (`component-forms-password-field`) - Password input with visibility toggle
- **SearchField** (`component-forms-search-field`) - Search input with icon
- **URLField** (`component-forms-url-field`) - URL input
- **DateField** (`component-forms-date-field`) - Date picker
- **ColorField** (`component-forms-color-field`) - Color picker
- **ChoiceList** (`component-forms-choice-list`) - Radio or checkbox group
- **DropZone** (`component-forms-drop-zone`) - File upload with drag-and-drop

### Feedback
Components for displaying status and loading states.

- **Banner** (`component-feedback-banner`) - Highlights important information
- **Spinner** (`component-feedback-spinner`) - Loading indicator

### Overlays
Components for displaying content in overlays.

- **Modal** (`component-overlays-modal`) - Dialog overlay
- **Popover** (`component-overlays-popover`) - Contextual popup
- **Tooltip** (`component-overlays-tooltip`) - Helpful information overlay

### Media
Components for displaying images and icons.

- **Image** (`component-media-image`) - Responsive image with aspect ratio control
- **Icon** (`component-media-icon`) - Lucide icon component
- **Avatar** (`component-media-avatar`) - User profile image or initials
- **Thumbnail** (`component-media-thumbnail`) - Small preview image

### Structure
Components for layout and organization.

- **Box** (`component-structure-box`) - Generic container
- **Stack** (`component-structure-stack`) - Flex container for organizing elements
- **Grid** (`component-structure-grid`) - Grid layout system
- **Divider** (`component-structure-divider`) - Visual separator
- **Table** (`component-structure-table`) - Data table
- **OrderedList** (`component-structure-ordered-list`) - Numbered list
- **UnorderedList** (`component-structure-unordered-list`) - Bulleted list

### Titles & Text
Components for typography and text display.

- **Heading** (`component-titles-text-heading`) - Hierarchical titles
- **Text** (`component-titles-text-text`) - Inline text with styles
- **Paragraph** (`component-titles-text-paragraph`) - Block of text
- **Badge** (`component-titles-text-badge`) - Status indicator
- **Chip** (`component-titles-text-chip`) - Keyword label with optional remove

## Usage Examples

### Using Components as Theme Blocks

Theme blocks can be added to sections that accept blocks using `{% content_for 'blocks' %}`. Blocks are referenced by their simple name (without the `block-` prefix).

**In Templates:**
```liquid
{% comment %} Static block with default settings {% endcomment %}
{% content_for 'block', type: 'button', id: 'cta-button' %}

{% comment %} Static block with custom settings {% endcomment %}
{% content_for 'block', type: 'button', id: 'custom-button', settings: {
  text: 'Buy Now',
  variant: 'primary',
  size: 'large'
} %}

{% comment %} Dynamic blocks area {% endcomment %}
<div class="content-area">
  {% content_for 'blocks' %}
</div>
```

**In Sections:**
```liquid
{% schema %}
{
  "name": "Custom Section",
  "blocks": [
    { "type": "@theme" }  // Accept all theme blocks
  ]
}
{% endschema %}

<div class="section-content">
  {% content_for 'blocks' %}
</div>
```

**Available Theme Blocks:**
- `button` - Button component
- `banner` - Banner component
- `text-field` - Text input field
- `image` - Image component
- `modal` - Modal dialog
- `divider` - Visual divider
- `grid` - Grid layout
- `stack` - Stack layout
- `text` - Text content
- `group` - Group container for nested blocks

### Using Components as Snippets

```liquid
{% comment %} Button Component {% endcomment %}
{% render 'component-actions-button',
  text: 'Click me',
  variant: 'primary',
  size: 'medium',
  icon: 'shopping-cart',
  icon_position: 'left'
%}

{% comment %} Heading Component {% endcomment %}
{% render 'component-titles-text-heading',
  text: 'Page Title',
  level: 1,
  align: 'center',
  color: 'primary'
%}

{% comment %} TextField Component {% endcomment %}
{% render 'component-forms-text-field',
  name: 'email',
  label: 'Email address',
  type: 'email',
  required: true,
  placeholder: 'Enter your email'
%}

{% comment %} Banner Component {% endcomment %}
{% render 'component-feedback-banner',
  title: 'Important Notice',
  text: 'This is an important message',
  variant: 'warning',
  dismissible: true
%}

{% comment %} Modal Component {% endcomment %}
{% render 'component-overlays-modal',
  id: 'my-modal',
  title: 'Modal Title',
  content: 'Modal content here',
  size: 'md',
  show_close: true
%}
```

### Using Components as Theme Blocks

Components are available as blocks in the Theme Editor. Blocks use simple names (e.g., `button`, `grid`, `banner`) and can be added to sections that accept blocks.

**Available Theme Blocks:**
- `button` - Button component with variants, sizes, and icons
- `banner` - Banner component for important messages
- `text-field` - Text input field with validation
- `image` - Responsive image with aspect ratio control
- `modal` - Modal dialog overlay
- `divider` - Visual separator
- `grid` - Grid layout system
- `stack` - Stack layout (horizontal/vertical)
- `text` - Text content block
- `group` - Group container for nested blocks

**Adding Blocks to Sections:**

Sections that accept blocks use `{% content_for 'blocks' %}` in their template and define blocks in their schema:

```liquid
{% schema %}
{
  "name": "Custom Section",
  "blocks": [
    { "type": "@theme" }  // Accept all theme blocks
  ]
}
{% endschema %}

<div class="section-content">
  {% content_for 'blocks' %}
</div>
```

**Using Blocks in Templates:**

You can reference blocks statically in templates:

```liquid
{% comment %} Static block with default settings {% endcomment %}
{% content_for 'block', type: 'button', id: 'cta-button' %}

{% comment %} Static block with custom settings {% endcomment %}
{% content_for 'block', type: 'button', id: 'custom-button', settings: {
  text: 'Buy Now',
  variant: 'primary',
  size: 'large'
} %}
```

Each block has customizable settings in the Theme Editor sidebar.

## Design System Integration

All components use CSS variables from the design system defined in `snippets/css-variables.liquid`. This ensures:

- **Consistent styling** across all components
- **Easy customization** through theme settings
- **Responsive behavior** using design system spacing and typography scales

### Available CSS Variables

Components use variables like:
- `--color-primary`, `--color-secondary`, `--color-accent`
- `--font-size-base`, `--font-size-sm`, `--font-size-lg`, etc.
- `--spacing-xs`, `--spacing-sm`, `--spacing-md`, etc.
- `--button-padding`, `--button-border-radius`
- `--card-padding`, `--card-border-radius`
- `--shadow`, `--shadow-lg`
- `--transition`

## Customization

### Component Defaults

Set default values for components in Theme Settings > Component Library:

- Default button variant (primary, secondary, outline, ghost)
- Default button size (small, medium, large)
- Default link variant
- Default badge variant
- Default banner variant

### Per-Component Customization

Each component accepts parameters for customization:

- **Variants**: Different visual styles (primary, secondary, outline, etc.)
- **Sizes**: Size options (xs, sm, md, lg, xl)
- **Colors**: Color options using design system variables
- **Spacing**: Padding and margin options
- **States**: Disabled, loading, error states

## Component Parameters

### Common Parameters

Most components accept:
- `class` - Additional CSS classes
- `attributes` - Additional HTML attributes

### Component-Specific Parameters

See individual component files for detailed parameter documentation. Each component includes:
- Parameter descriptions
- Type information
- Default values
- Usage examples

## Accessibility

All components follow accessibility best practices:

- **ARIA labels** where appropriate
- **Keyboard navigation** support
- **Focus management** for modals and overlays
- **Screen reader** friendly markup
- **Semantic HTML** elements

## Browser Support

Components are tested and work in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Components use **CSS variables** for efficient styling
- **Lazy loading** for images
- **Minimal JavaScript** with event delegation
- **Optimized animations** using CSS transitions

## Contributing

When adding new components:

1. Follow the component pattern in existing components
2. Use design system CSS variables
3. Include accessibility attributes
4. Add documentation comments
5. Create both snippet and block versions
6. Test in Theme Editor
7. Run theme check

## Component Index

For a quick reference of all available components, see the component files in the `snippets/` directory with the `component-` prefix.

