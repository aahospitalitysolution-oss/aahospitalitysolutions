# Floating Contact Icons

A fixed-position contact widget with phone and WhatsApp buttons, styled to match the A&A Hospitality brand.

## Features

- **Phone Button**: Direct call functionality with charcoal-blue hover effect
- **WhatsApp Button**: Opens WhatsApp chat with steel-blue hover effect
- **Tooltips**: Hover tooltips showing action descriptions
- **Responsive**: Adapts to mobile screens
- **Accessible**: Proper ARIA labels and keyboard navigation support
- **Brand Colors**: Uses A&A Hospitality color palette (charcoal-blue, rosy-taupe, steel-blue, parchment)

## Customization

### Update Phone Number

Edit the `href` attribute in `FloatingContactIcons.tsx`:

```tsx
href="tel:+1234567890"  // Replace with your phone number
```

### Update WhatsApp Number and Message

Edit the WhatsApp link:

```tsx
href="https://wa.me/1234567890?text=Hello!%20I%27m%20interested%20in%20your%20hospitality%20services"
```

Replace:
- `1234567890` with your WhatsApp number (include country code, no + or spaces)
- The text after `text=` with your custom pre-filled message (URL encoded)

### Styling

The component uses CSS modules (`FloatingContactIcons.module.css`) with brand colors:

- **Phone Button**: 
  - Border: rosy-taupe
  - Hover background: charcoal-blue
  - Icon: charcoal-blue → parchment on hover

- **WhatsApp Button**:
  - Border: steel-blue
  - Hover background: steel-blue
  - Icon: steel-blue → parchment on hover

### Position

Default position is bottom-right (24px from edges). To change:

Edit in `FloatingContactIcons.module.css`:

```css
.container {
  bottom: var(--space-6);  /* 24px */
  right: var(--space-6);   /* 24px */
}
```

## Analytics Integration

To track clicks, you can add event handlers:

```tsx
onClick={() => {
  // Your analytics code here
  console.log('Phone button clicked');
}}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation for older browsers
