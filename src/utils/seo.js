// utils/seo.js
// =========================================
// GLOBAL SEO ENGINE FOR ODDLEX BUSINESS HUB
// =========================================

const BASE_URL = "https://business-hub-nine.vercel.app/";

export function generateSEO({
  title = "Oddlex Business Hub – 40+ Free Professional Business Tools",
  description = "Oddlex Business Hub offers 40+ free professional tools for finance, billing, CRM, analytics, marketing & productivity. Everything you need to run and grow your business.",
  keywords = "Oddlex, Oddlex tools, business management tools, invoice generator, CRM, analytics dashboard, project manager, productivity tools, marketing tools, free business suite",
  url = BASE_URL,
  image = `${BASE_URL}/og-image.png`,
  type = "website",
}) {
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url,
      type,
      siteName: "Oddlex Business Hub",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      image
    },
    alternates: {
      canonical: url
    }
  };
}


// ==========================
// PAGE-SPECIFIC SEO HELPERS
// ==========================

// Homepage SEO
export function homeSEO() {
  return generateSEO({
    title: "Oddlex Business Hub – Free Business Tools for Work & Growth",
    description:
      "All-in-one business tools: finance, invoicing, CRM, projects, analytics, branding & productivity. 40+ professional tools. Free forever.",
    url: `${BASE_URL}/`,
  });
}


// Tools listing page
export function toolsSEO() {
  return generateSEO({
    title: "Oddlex Tools – 40+ Free Professional Business Tools",
    description:
      "Explore 40+ free tools: Invoice Generator, CRM Manager, Analytics Dashboard, Project Manager, Payment Reminders, Budget Planner & more.",
    url: `${BASE_URL}/tools`,
  });
}


// Single Tool SEO
export function toolSEO(name, slug, description) {
  return generateSEO({
    title: `${name} – Free Online Tool by Oddlex`,
    description,
    url: `${BASE_URL}/tools/${slug}`,
  });
}


// Blog Listing SEO
export function blogSEO() {
  return generateSEO({
    title: "Oddlex Business Hub Blog – Business, Finance & Growth",
    description:
      "Read expert articles about finance, freelancing, business tools, marketing, productivity & online business growth.",
    url: `${BASE_URL}/blog`,
  });
}


// Individual Blog Article SEO
export function blogPostSEO(post) {
  return generateSEO({
    title: `${post.title} – Oddlex Blog`,
    description: post.description,
    image: post.coverImage ?? `${BASE_URL}/og-image.png`,
    url: `${BASE_URL}/blog/${post.slug}`,
    type: "article",
  });
}


// About Page SEO
export function aboutSEO() {
  return generateSEO({
    title: "About Oddlex Business Hub – Our Mission & Story",
    description:
      "Oddlex Business Hub empowers freelancers & businesses with professional tools — 100% free forever. Learn about our mission and values.",
    url: `${BASE_URL}/about`,
  });
}


// Dashboard SEO
export function dashboardSEO() {
  return generateSEO({
    title: "Dashboard – Oddlex Business Hub",
    description: "Manage your invoices, clients, payments, analytics & productivity tools from your central Oddlex dashboard.",
    url: `${BASE_URL}/dashboard`,
  });
}
// Contact Page SEO
export function contactSEO() {
  return generateSEO({
    title: "Contact Us – Oddlex Business Hub",
    description: "Get in touch with the Oddlex team for support, feedback, or inquiries about our business tools.",
    url: `${BASE_URL}/contact`,
  });
}
