# Mentara Landing Page

A beautiful, modern landing page for Mentara - a mental health technology platform. Built with Svelte, TailwindCSS, and EmailJS.

## 🚀 Features

- **Modern Design**: Vibrant, animated landing page with custom Mentara branding
- **Smooth Animations**: Professional animations using svelte-motion (scroll-triggered, hover effects)
- **Responsive**: Fully responsive design that works on all devices
- **Demo Request Form**: Comprehensive form to capture leads and demo requests
- **Email Integration**: Server-side email notifications via EmailJS (Node.js)
- **Debug Mode**: Pre-filled forms in development with detailed error messages
- **Custom Styling**: Using Mentara's custom color scheme and fonts (Futura, Kollektif)
- **Rich Assets**: Team photos, icons, and brand assets ready for expansion

## 🛠️ Tech Stack

- **Framework**: SvelteKit 2.x (Svelte 5)
- **Styling**: TailwindCSS 4.x with custom OKLCH color system
- **Animations**: svelte-motion (Framer Motion for Svelte)
- **Email Service**: EmailJS (Node.js)
- **Package Manager**: pnpm
- **Language**: TypeScript

## 📦 Installation

1. Clone the repository and navigate to the landing page directory:
```bash
cd mentara-landing
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your EmailJS credentials to `.env`:
- `EMAILJS_SERVICE_ID`: Your EmailJS service ID
- `EMAILJS_TEMPLATE_ID`: Your EmailJS template ID
- `EMAILJS_PUBLIC_KEY`: Your EmailJS public key
- `EMAILJS_PRIVATE_KEY`: (Optional) Your EmailJS private key for enhanced security
- `NODE_ENV`: Set to `development` for debug mode with pre-filled forms

Get these from [EmailJS Dashboard](https://dashboard.emailjs.com/)

## 🎨 EmailJS Template Setup

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Create a new email service (Gmail, Outlook, etc.)
3. Create a new email template with the following parameters:
   - `{{firstName}}` - First name
   - `{{lastName}}` - Last name
   - `{{email}}` - Email address
   - `{{companyName}}` - Company name
   - `{{jobTitle}}` - Job title
   - `{{contactNumber}}` - Contact number
   - `{{companySize}}` - Company size
   - `{{message}}` - Additional message
   - `{{html}}` - Pre-formatted HTML content
   - `{{submittedAt}}` - Submission timestamp

**Template Body Example:**
```
{{{html}}}
```

This will use the pre-formatted HTML from the application.

## 🚀 Development

Start the development server:
```bash
pnpm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Build

Build for production:
```bash
pnpm run build
```

Preview production build:
```bash
pnpm run preview
```

## 📝 Environment Variables

Required environment variables:

```env
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
```

## 🎨 Custom Styles

The landing page uses Mentara's custom design system:

### Colors
- **Primary**: Green (`oklch(0.56 0.1223 127.47)`)
- **Secondary**: Darker green (`oklch(0.4 0.0812 92.8)`)
- **Community Colors**: Calm, warm, soothing, heart, and accent variations

### Fonts
- **Futura**: Headings and brand text
- **Kollektif**: Body text and UI elements

## 📄 Pages

- `/` - Landing page with hero section and features
- `/demo` - Demo request form

## 🔌 API Routes

- `POST /api/submit-demo` - Handles demo form submissions and sends emails

## 📋 Form Fields

The demo request form includes:
- First Name (required)
- Last Name (required)
- Company Name (required)
- Job Title (required)
- Email Address (required)
- Contact Number (required)
- Company Size (optional dropdown)
- Additional Information (optional textarea)

## 🔒 Security

- Client-side form validation
- Server-side validation
- Email format verification
- Required field checks
- Environment variables for sensitive data

## 📱 Mobile Responsive

The landing page is fully responsive with:
- Mobile-first design approach
- Hamburger menu for mobile navigation
- Touch-friendly buttons and forms
- Optimized layouts for all screen sizes

## 🎯 Future Enhancements

- Analytics integration
- A/B testing capabilities
- Multi-language support
- Additional pages (About, Services, etc.)
- Integration with main Mentara application

## 📞 Support

For questions or issues, please contact the Mentara development team.

## 📄 License

© 2025 Mentara. All rights reserved.
