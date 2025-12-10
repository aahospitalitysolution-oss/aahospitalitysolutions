"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Label } from "@/components/ui";
import { MapPin, Phone, MessageCircle, Mail, Loader2 } from "lucide-react";
import styles from "./ContactSection.module.css";
import { MorphSection } from "./MorphSection";
import { useLanguage } from "@/contexts/LanguageContext";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactSection() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: t.contactSection.successMessage,
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error("Failed to send message");
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: t.contactSection.errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MorphSection
      id="contact"
      className={styles.section}
      variant="top"
      backgroundColor="var(--parchment)"
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t.contactSection.title}</h2>
          <p className={styles.subtitle}>
            {t.contactSection.subtitle}
          </p>
        </div>

        <div className={styles.grid}>
          {/* Left Card - Contact Information */}
          <Card className={styles.infoCard}>
            <CardHeader>
              <CardTitle>{t.contactSection.getInTouch}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.contactInfo}>
                {/* Location */}
                <div className={styles.infoItem}>
                  <div className={styles.infoHeader}>
                    <MapPin className={styles.icon} />
                    <span className={styles.infoLabel}>{t.contactSection.visitUs}</span>
                  </div>
                  <p className={styles.infoText} dangerouslySetInnerHTML={{ __html: t.contactSection.address }}>
                  </p>
                </div>

                {/* Phone */}
                <div className={styles.infoItem}>
                  <div className={styles.infoHeader}>
                    <Phone className={styles.icon} />
                    <span className={styles.infoLabel}>{t.contactSection.callUs}</span>
                  </div>
                  <a
                    href="tel:+66614157942"
                    className={styles.infoLink}
                  >
                    +66 6 1415 7942
                  </a>
                </div>

                {/* WhatsApp */}
                <div className={styles.infoItem}>
                  <div className={styles.infoHeader}>
                    <MessageCircle className={styles.icon} />
                    <span className={styles.infoLabel}>WhatsApp</span>
                  </div>
                  <a
                    href="https://wa.me/66614157942?text=Hello!%20I%27m%20interested%20in%20your%20hospitality%20services"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.infoLink}
                  >
                    {t.contactSection.chatWithUs}
                  </a>
                </div>

                {/* Email */}
                <div className={styles.infoItem}>
                  <div className={styles.infoHeader}>
                    <Mail className={styles.icon} />
                    <span className={styles.infoLabel}>{t.contactSection.email}</span>
                  </div>
                  <a
                    href="mailto:shankar.sreekumar@aahospitalitysolutions.com"
                    className={styles.infoLink}
                  >
                    shankar.sreekumar@aahospitalitysolutions.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Card - Contact Form */}
          <Card className={styles.formCard}>
            <CardHeader>
              <CardTitle>{t.contactSection.sendMessage}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Name Field */}
                <div className={styles.formField}>
                  <Label htmlFor="name">{t.contactSection.nameLabel}</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder={t.contactSection.namePlaceholder}
                  />
                </div>

                {/* Email Field */}
                <div className={styles.formField}>
                  <Label htmlFor="email">{t.contactSection.emailLabel}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder={t.contactSection.emailPlaceholder}
                  />
                </div>

                {/* Phone Field */}
                <div className={styles.formField}>
                  <Label htmlFor="phone">{t.contactSection.phoneLabel}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+66 6 1415 7942"
                  />
                </div>

                {/* Subject Field */}
                <div className={styles.formField}>
                  <Label htmlFor="subject">{t.contactSection.subjectLabel}</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder={t.contactSection.subjectPlaceholder}
                  />
                </div>

                {/* Message Field */}
                <div className={styles.formField}>
                  <Label htmlFor="message">{t.contactSection.messageLabel}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder={t.contactSection.messagePlaceholder}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className={styles.spinner} />
                      {t.contactSection.sendingButton}
                    </>
                  ) : (
                    t.contactSection.sendButton
                  )}
                </Button>

                {/* Status Message */}
                {submitStatus.type && (
                  <div
                    className={`${styles.statusMessage} ${submitStatus.type === "success"
                      ? styles.statusSuccess
                      : styles.statusError
                      }`}
                  >
                    {submitStatus.message}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MorphSection>
  );
}
