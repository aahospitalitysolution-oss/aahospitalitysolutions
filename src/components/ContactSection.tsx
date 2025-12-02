"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Label } from "@/components/ui";
import { MapPin, Phone, MessageCircle, Mail, Loader2 } from "lucide-react";
import styles from "./ContactSection.module.css";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactSection() {
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
          message: "Thank you for reaching out! We'll be in touch soon.",
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
        message: "Unable to send message. Please try again or contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Let's Connect</h2>
          <p className={styles.subtitle}>
            Ready to elevate your hospitality experience? We'd love to hear from you.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Left Card - Contact Information */}
          <Card className={styles.infoCard}>
            <CardHeader>
              <CardTitle>Get In Touch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.contactInfo}>
                {/* Location */}
                <div className={styles.infoItem}>
                  <div className={styles.infoHeader}>
                    <MapPin className={styles.icon} />
                    <span className={styles.infoLabel}>Visit Us</span>
                  </div>
                  <p className={styles.infoText}>
                    123 Hospitality Lane<br />
                    Suite 100<br />
                    City, State 12345
                  </p>
                </div>

                {/* Phone */}
                <div className={styles.infoItem}>
                  <div className={styles.infoHeader}>
                    <Phone className={styles.icon} />
                    <span className={styles.infoLabel}>Call Us</span>
                  </div>
                  <a
                    href="tel:+1234567890"
                    className={styles.infoLink}
                  >
                    +1 (234) 567-890
                  </a>
                </div>

                {/* WhatsApp */}
                <div className={styles.infoItem}>
                  <div className={styles.infoHeader}>
                    <MessageCircle className={styles.icon} />
                    <span className={styles.infoLabel}>WhatsApp</span>
                  </div>
                  <a
                    href="https://wa.me/1234567890?text=Hello!%20I%27m%20interested%20in%20your%20hospitality%20services"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.infoLink}
                  >
                    Chat with us
                  </a>
                </div>

                {/* Email */}
                <div className={styles.infoItem}>
                  <div className={styles.infoHeader}>
                    <Mail className={styles.icon} />
                    <span className={styles.infoLabel}>Email</span>
                  </div>
                  <a
                    href="mailto:hello@anahospitality.com"
                    className={styles.infoLink}
                  >
                    hello@anahospitality.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Card - Contact Form */}
          <Card className={styles.formCard}>
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Name Field */}
                <div className={styles.formField}>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your name"
                  />
                </div>

                {/* Email Field */}
                <div className={styles.formField}>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Phone Field */}
                <div className={styles.formField}>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (234) 567-890"
                  />
                </div>

                {/* Subject Field */}
                <div className={styles.formField}>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="How can we help?"
                  />
                </div>

                {/* Message Field */}
                <div className={styles.formField}>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Tell us about your needs..."
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
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>

                {/* Status Message */}
                {submitStatus.type && (
                  <div
                    className={`${styles.statusMessage} ${
                      submitStatus.type === "success"
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
    </section>
  );
}
