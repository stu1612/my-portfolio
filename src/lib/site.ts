// Site-wide facts shown in the shell: navbar, menu and footer.

export type NavItem = { label: string; href: string };

export const site = {
  name: "Stu Bolderson",
  location: "Lund",
  locationLong: "Lund, Sweden",
  timeZone: "Europe/Stockholm",
  availability: { open: true, label: "Open to work" },
  email: "boldersonstu@gmail.com",
  github: "https://github.com/stu1612",
  linkedin: "https://www.linkedin.com/in/stuartbolderson/",
  copyrightYear: 2026,
  nav: [
    { label: "Index", href: "/" },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Now", href: "/now" },
    { label: "Contact", href: "/contact" },
  ] satisfies NavItem[],
} as const;
