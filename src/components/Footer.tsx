"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

interface FooterLink {
  title: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: "Services",
    links: [
      { title: "Consulting", href: "/services/consulting" },
      { title: "Design", href: "/services/design" },
      { title: "Management", href: "/services/management" },
      { title: "Training", href: "/services/training" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "Home", href: "/" },
      { title: "About", href: "/about" },
      { title: "Our Story", href: "/#story" },
      { title: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { title: "Blog", href: "/blog" },
      { title: "Case Studies", href: "/case-studies" },
      { title: "Insights", href: "/insights" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Column 1: Branding */}
          <div className={styles.brandColumn}>
            <Link href="/" aria-label="Go home" className={styles.logoLink}>
              <Image
                src="/logo-full-blue.svg"
                alt="A&A Hospitality Solutions"
                width={192}
                height={48}
                className={styles.logo}
              />
            </Link>

            <p className={styles.brandDescription}>
              Elevating hospitality experiences through innovative solutions,
              thoughtful design, and exceptional service.
            </p>

            <div className={styles.socialLinks}>
              <Link
                href="https://linkedin.com/company/anahospitality"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className={styles.socialLink}
              >
                <svg
                  className={styles.socialIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z" />
                </svg>
              </Link>
              <Link
                href="https://instagram.com/anahospitality"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={styles.socialLink}
              >
                <svg
                  className={styles.socialIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Columns 2-4: Footer Links */}
          {footerColumns.map((column, columnIndex) => (
            <div key={columnIndex} className={styles.linkColumn}>
              <h3 className={styles.columnTitle}>{column.title}</h3>
              <ul className={styles.linkList}>
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className={styles.link}>
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section with copyright */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} A&A Hospitality Solutions. All rights
            reserved.
          </p>
          <div className={styles.bottomLinks}>
            <Link href="/privacy" className={styles.bottomLink}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={styles.bottomLink}>
              Terms of Service
            </Link>
            <Link href="#contact" className={styles.bottomLink}>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
