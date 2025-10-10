# Mentara Landing Page - Quick Setup Guide

## ✅ What's Been Created

A complete landing page application with:

### Pages
- **Landing Page** (`/`) - Hero section, features, and CTA
- **Demo Form** (`/demo`) - Comprehensive demo request form

### Components
- `Navbar.svelte` - Responsive navigation with mobile menu
- `Hero.svelte` - Hero section with stats
- Email utility functions with EmailJS integration

### Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Custom Mentara styling (colors, fonts, animations)
- ✅ EmailJS integration for form submissions
- ✅ Form validation (client & server side)
- ✅ Professional email templates

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd mentara-landing
pnpm install
```

### 2. Configure EmailJS

**Get your credentials from [EmailJS Dashboard](https://dashboard.emailjs.com/):**

1. Create a free account
2. Add an email service (Gmail, Outlook, etc.)
3. Create a new email template (see template setup below)
4. Get your credentials

### 3. Create `.env` file
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxxx
EMAILJS_PUBLIC_KEY=xxxxxxxxxxxx
```

### 4. Start Development Server
```bash
pnpm run dev
```

Visit: `http://localhost:5173`

## 📧 EmailJS Template Setup

In your EmailJS template editor, use this simple template:

**Subject:** New Demo Request from {{firstName}} {{lastName}}

**Body:**
```
{{{html}}}
```

That's it! The app sends pre-formatted HTML, so your template just needs to use `{{{html}}}` (triple braces for unescaped HTML).

### Template Parameters Available
All these are available if you want to customize your template:
- `{{firstName}}`, `{{lastName}}`, `{{fullName}}`
- `{{email}}`, `{{contactNumber}}`
- `{{companyName}}`, `{{jobTitle}}`, `{{companySize}}`
- `{{message}}`, `{{submittedAt}}`
- `{{{html}}}` - Pre-formatted email (recommended)

## 🎨 Customization

### Colors
Edit `tailwind.config.js` and `src/app.css` to modify:
- Primary color (green)
- Secondary colors
- Community colors (calm, warm, soothing, heart, accent)

### Fonts
The app uses Mentara's custom fonts:
- **Futura** - Headings
- **Kollektif** - Body text

Font files are in `static/fonts/`

### Content
Edit these files to customize content:
- `src/routes/+page.svelte` - Landing page content
- `src/routes/demo/+page.svelte` - Form fields and labels
- `src/lib/components/Hero.svelte` - Hero section stats

## 📝 Form Fields

Current form includes:
- ✅ First Name (required)
- ✅ Last Name (required)
- ✅ Company Name (required)
- ✅ Job Title (required)
- ✅ Email Address (required)
- ✅ Contact Number (required)
- ✅ Company Size (optional dropdown)
- ✅ Additional Message (optional)

## 🏗️ Build for Production

```bash
pnpm run build
pnpm run preview
```

## 📦 Project Structure

```
mentara-landing/
├── src/
│   ├── app.css                 # Global styles (Mentara design system)
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Navbar.svelte   # Navigation bar
│   │   │   └── Hero.svelte     # Hero section
│   │   └── utils/
│   │       └── email.ts        # EmailJS utilities
│   └── routes/
│       ├── +page.svelte        # Landing page
│       ├── demo/
│       │   └── +page.svelte    # Demo form page
│       └── api/
│           └── submit-demo/
│               └── +server.ts  # API endpoint
├── static/
│   └── fonts/                  # Custom fonts
├── .env.example                # Environment template
└── README.md                   # Full documentation
```

## 🔧 Tech Stack

- **Framework**: SvelteKit 2.x
- **Styling**: TailwindCSS 4.x
- **Email**: EmailJS
- **Package Manager**: pnpm
- **Language**: TypeScript

## 🎯 Next Steps

1. ✅ Set up EmailJS account and get credentials
2. ✅ Add credentials to `.env` file
3. ✅ Test the form submission
4. 📝 Customize content and styling as needed
5. 🚀 Deploy to production

## 🌐 Deployment

This app can be deployed to:
- **Vercel** (recommended for SvelteKit)
- **Netlify**
- **Cloudflare Pages**
- Any Node.js hosting

Remember to add your environment variables in the hosting platform's settings!

## 💡 Tips

- Test email sending in development mode first
- Check EmailJS dashboard for sent emails and errors
- Monitor form submissions in EmailJS dashboard
- Customize the email HTML template in `src/routes/api/submit-demo/+server.ts`

## 🐛 Troubleshooting

### Emails not sending?
1. Check `.env` file has correct credentials
2. Verify EmailJS service is active
3. Check EmailJS template exists and uses `{{{html}}}`
4. Look at browser console and server logs for errors

### Styles not applying?
1. Make sure `pnpm run dev` is running
2. Clear browser cache
3. Check TailwindCSS config includes all file paths

## 📞 Support

For issues or questions, refer to:
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [EmailJS Docs](https://www.emailjs.com/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

---

Happy building! 🚀

