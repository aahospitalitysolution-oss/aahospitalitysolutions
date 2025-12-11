# Contact Section & Footer

Comprehensive contact section and footer components for A&A Hospitality, styled to match the brand identity.

## Contact Section

A two-column layout featuring contact information and a contact form.

### Features

- **Contact Information Card**:
  - Location with address
  - Phone number with click-to-call
  - WhatsApp link with pre-filled message
  - Email with mailto link
  - Icons using lucide-react

- **Contact Form Card**:
  - Name, Email, Phone, Subject, Message fields
  - Form validation
  - Loading states
  - Success/error messages
  - Accessible form labels

### Customization

#### Update Contact Information

Edit `src/components/ContactSection.tsx`:

```tsx
// Address
<p className={styles.infoText}>
  123 Hospitality Lane<br />
  Suite 100<br />
  City, State 12345
</p>

// Phone
<a href="tel:+1234567890" className={styles.infoLink}>
  +1 (234) 567-890
</a>

// WhatsApp
<a
  href="https://wa.me/1234567890?text=Hello!%20I%27m%20interested%20in%20your%20hospitality%20services"
  ...
>

// Email
<a href="mailto:hello@aahospitalitysolutions.com" className={styles.infoLink}>
  hello@aahospitalitysolutions.com
</a>
```

#### Form API Endpoint

The form submits to `/api/contact`. You'll need to create this API route:

```tsx
// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  
  // Process form data (send email, save to database, etc.)
  
  return NextResponse.json({ success: true });
}
```

## Footer

A comprehensive footer with branding, navigation links, and social media.

### Features

- **Brand Column**:
  - Logo
  - Company description
  - Social media links (LinkedIn, Instagram)

- **Link Columns**:
  - Services
  - Company
  - Resources

- **Bottom Section**:
  - Copyright notice
  - Legal links (Privacy, Terms)
  - Contact link

### Customization

#### Update Footer Links

Edit `src/components/Footer.tsx`:

```tsx
const footerColumns: FooterColumn[] = [
  {
    title: "Services",
    links: [
      { title: "Your Service", href: "/services/your-service" },
      // Add more links
    ],
  },
  // Add more columns
];
```

#### Update Social Links

```tsx
<Link
  href="https://linkedin.com/company/yourcompany"
  ...
>
```

#### Update Logo

Replace the logo path in Footer.tsx:

```tsx
<Image
  src="/your-logo.svg"
  alt="Your Company"
  width={192}
  height={48}
/>
```

## Brand Colors Used

- **Charcoal Blue** (#28536b): Primary text, footer background, buttons
- **Rosy Taupe** (#c2948a): Accents, error states
- **Steel Blue** (#7ea8be): Links, icons, hover states
- **Parchment** (#f6f0ed): Background, light text
- **Khaki Beige** (#bbb193): Secondary accents

## Responsive Design

Both components are fully responsive:

- **Desktop**: Two-column layout
- **Tablet**: Adjusted spacing and sizing
- **Mobile**: Single-column stacked layout

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus states
- Reduced motion support
- Form validation
- Screen reader friendly

## Integration

Both components are already added to the main page (`src/app/page.tsx`):

```tsx
<main>
  <Landing />
  <ContactSection />
</main>
<Footer />
```

The Contact Section appears before the Footer at the bottom of the page.
