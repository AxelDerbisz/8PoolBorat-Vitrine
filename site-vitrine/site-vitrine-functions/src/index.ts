/**
 * Cloud Functions for L'Edorat 8 Pool
 *
 * This file contains Firebase Cloud Functions for the public website.
 */

import { setGlobalOptions } from "firebase-functions";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import sgMail from "@sendgrid/mail";

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Set global options for cost control
setGlobalOptions({
  maxInstances: 10,
  region: "europe-west1" // Closest to France
});

/**
 * Contact Form Data Interface
 */
interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/**
 * Send Contact Email
 *
 * Handles contact form submissions from the website.
 * Stores the message in Firestore and optionally sends an email notification.
 *
 * Usage from frontend:
 *   const sendContactEmail = httpsCallable(functions, 'sendContactEmail');
 *   await sendContactEmail({ name, email, subject, message });
 */
export const sendContactEmail = onCall<ContactFormData>(
  {
    region: "europe-west1",
    secrets: ["SENDGRID_API_KEY"]
  },
  async (request) => {
    const data = request.data;

    // Rate limiting: Check for recent submissions from same email
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentSubmissions = await db
      .collection("contactMessages")
      .where("email", "==", data.email)
      .where("timestamp", ">", oneMinuteAgo)
      .limit(1)
      .get();

    if (!recentSubmissions.empty) {
      logger.warn("Rate limit exceeded", { email: data.email });
      throw new HttpsError(
        "resource-exhausted",
        "Please wait at least 1 minute between submissions."
      );
    }

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      logger.warn("Contact form submission missing required fields", {
        data: data,
      });
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields. Please provide name, email, subject, and message."
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      logger.warn("Invalid email format", { email: data.email });
      throw new HttpsError(
        "invalid-argument",
        "Invalid email format."
      );
    }

    // Validate message length
    if (data.message.length < 10) {
      throw new HttpsError(
        "invalid-argument",
        "Message must be at least 10 characters long."
      );
    }

    try {
      // Store contact message in Firestore
      const messageRef = await db.collection("contactMessages").add({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        timestamp: FieldValue.serverTimestamp(),
        status: "new",
        read: false,
      });

      logger.info("Contact message stored successfully", {
        messageId: messageRef.id,
        email: data.email,
      });

      // Send email notification to club president
      try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

        const msg = {
          to: "axel.derbisz@gmail.com", // Change to actual president email
          from: "axel.derbisz@gmail.com", // Must match verified sender in SendGrid
          replyTo: data.email,
          subject: `Nouveau message: ${data.subject}`,
          text: `
Nouveau message depuis le formulaire de contact:

De: ${data.name}
Email: ${data.email}
Téléphone: ${data.phone || "Non renseigné"}
Sujet: ${data.subject}

Message:
${data.message}

---
Ce message a été envoyé depuis www.ledorat8pool.fr
          `,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a472a;">Nouveau message de contact</h2>

              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>De:</strong> ${data.name}</p>
                <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
                <p><strong>Téléphone:</strong> ${data.phone || "Non renseigné"}</p>
                <p><strong>Sujet:</strong> ${data.subject}</p>
              </div>

              <div style="margin: 20px 0;">
                <h3 style="color: #2d5a3d;">Message:</h3>
                <p style="white-space: pre-wrap;">${data.message}</p>
              </div>

              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

              <p style="color: #888; font-size: 12px;">
                Ce message a été envoyé depuis le formulaire de contact de
                <a href="https://www.ledorat8pool.fr">www.ledorat8pool.fr</a>
              </p>
            </div>
          `,
        };

        await sgMail.send(msg);
        logger.info("Email notification sent successfully", {
          to: msg.to,
          from: data.email,
        });
      } catch (emailError: any) {
        // Log error but don't fail the function
        // Message is still saved in Firestore
        logger.error("Failed to send email notification", {
          error: emailError?.message || String(emailError),
          code: emailError?.code,
          response: emailError?.response?.body,
        });
      }

      return {
        success: true,
        message: "Your message has been sent successfully. We'll get back to you soon!",
        messageId: messageRef.id,
      };
    } catch (error) {
      logger.error("Error processing contact form", {
        error: error,
        data: data,
      });

      throw new HttpsError(
        "internal",
        "Failed to send message. Please try again later or contact us directly by email."
      );
    }
  }
);


export const getClubStats = onCall(
  { region: "europe-west1" },
  async () => {
    try {
      const [teamsSnapshot, newsSnapshot, sponsorsSnapshot] = await Promise.all([
        db.collection("teams").count().get(),
        db.collection("news").count().get(),
        db.collection("sponsors").count().get(),
      ]);

      return {
        totalTeams: teamsSnapshot.data().count,
        totalNews: newsSnapshot.data().count,
        totalSponsors: sponsorsSnapshot.data().count,
      };
    } catch (error) {
      logger.error("Error fetching club stats", { error });
      throw new HttpsError("internal", "Failed to fetch club statistics");
    }
  }
);
