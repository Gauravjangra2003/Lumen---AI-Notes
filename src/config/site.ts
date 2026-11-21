export const siteConfig = {
  name: "Lumen",
  tagline: "Your AI-powered second brain",
  description:
    "Lumen is an AI-powered knowledge base: write in a beautiful block editor, get inline AI help, search by meaning, and chat with your own notes.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  links: {
    github: "https://github.com",
  },
} as const;
