// Cloud Functions for L'Edorat 8 Pool Hub - v2.0 with in-app notifications
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { Resend } = require("resend");

admin.initializeApp();
const db = admin.firestore();

// Define secrets
const resendApiKey = defineSecret("RESEND_API_KEY");
const adminEmail = defineSecret("ADMIN_EMAIL");

// Helper to format date in French
const formatDateFr = (date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Triggered when a new booking is created
 * Sends notification email to admin
 */
exports.onBookingCreated = onDocumentCreated(
  {
    document: "bookings/{bookingId}",
    secrets: [resendApiKey, adminEmail],
  },
  async (event) => {
    const booking = event.data.data();
    const bookingId = event.params.bookingId;

    if (booking.status !== "pending") {
      return null;
    }

    try {
      const resend = new Resend(resendApiKey.value());

      const startTime = booking.startTime.toDate();
      const endTime = booking.endTime.toDate();

      await resend.emails.send({
        from: "L'Edorat 8 Pool <onboarding@resend.dev>",
        to: [adminEmail.value()],
        subject: `🎱 Nouvelle demande de réservation - ${booking.userName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a472a; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">L'Edorat 8 Pool</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Nouvelle demande de réservation</p>
            </div>

            <div style="padding: 30px; background: #f5f5f5;">
              <div style="background: white; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
                <h2 style="color: #1a472a; margin-top: 0;">Détails de la réservation</h2>

                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Membre</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">${booking.userName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Email</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.userEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Date</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">${formatDateFr(startTime)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Fin</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${formatDateFr(endTime)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Billard</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.billiardName}</td>
                  </tr>
                  ${booking.companions && booking.companions.length > 0 ? `
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Accompagnants</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.companions.join(", ")}</td>
                  </tr>
                  ` : ""}
                  ${booking.comment ? `
                  <tr>
                    <td style="padding: 10px 0; color: #666;">Commentaire</td>
                    <td style="padding: 10px 0;">${booking.comment}</td>
                  </tr>
                  ` : ""}
                </table>
              </div>

              <div style="text-align: center;">
                <a href="https://poolvitrine-682aa-hub.web.app/admin/reservations"
                   style="display: inline-block; background: #1a472a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Valider ou Refuser
                </a>
              </div>
            </div>

            <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>Cet email a été envoyé automatiquement par le Hub de L'Edorat 8 Pool</p>
            </div>
          </div>
        `,
      });

      console.log(`Email sent to admin for booking ${bookingId}`);
      return { success: true };
    } catch (error) {
      console.error("Error sending email to admin:", error);
      return { success: false, error: error.message };
    }
  }
);

/**
 * Triggered when a booking is updated
 * Sends confirmation or refusal email to user
 */
exports.onBookingUpdated = onDocumentUpdated(
  {
    document: "bookings/{bookingId}",
    secrets: [resendApiKey, adminEmail],
  },
  async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();
    const bookingId = event.params.bookingId;

    // Only proceed if status changed
    if (beforeData.status === afterData.status) {
      return null;
    }

    const resend = new Resend(resendApiKey.value());
    const startTime = afterData.startTime.toDate();
    const endTime = afterData.endTime.toDate();

    // Booking confirmed
    if (afterData.status === "confirmed") {
      try {
        // Get access codes from settings
        const settingsDoc = await db.collection("settings").doc("accessCodes").get();
        const codes = settingsDoc.exists ? settingsDoc.data() : { digicode: "----", alarmOff: "----", alarmOn: "----" };

        // Create in-app notification
        await db.collection("notifications").add({
          userId: afterData.userId,
          type: "booking_confirmed",
          title: "Réservation confirmée",
          message: `Votre réservation du ${formatDateFr(startTime)} a été confirmée.`,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          bookingId: bookingId,
        });

        await resend.emails.send({
          from: "L'Edorat 8 Pool <onboarding@resend.dev>",
          to: [afterData.userEmail],
          subject: `✅ Réservation confirmée - ${formatDateFr(startTime)}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1a472a; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">L'Edorat 8 Pool</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Réservation confirmée !</p>
              </div>

              <div style="padding: 30px; background: #f5f5f5;">
                <div style="background: #dcfce7; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
                  <h2 style="color: #16a34a; margin: 0;">✓ Votre réservation est confirmée</h2>
                </div>

                <div style="background: white; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
                  <h3 style="color: #1a472a; margin-top: 0;">Récapitulatif</h3>

                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Date</td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">${formatDateFr(startTime)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Fin</td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${formatDateFr(endTime)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #666;">Billard</td>
                      <td style="padding: 10px 0;">${afterData.billiardName}</td>
                    </tr>
                  </table>
                </div>

                <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
                  <h3 style="color: #b45309; margin-top: 0;">🔐 Codes d'accès</h3>
                  <p style="color: #92400e; margin-bottom: 15px;">Conservez ces codes précieusement. Ne les partagez pas.</p>

                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 12px; background: white; border-radius: 4px; margin-bottom: 8px;">
                        <span style="color: #666;">Code Digicode (porte)</span><br>
                        <strong style="font-size: 24px; color: #1a472a; font-family: monospace;">${codes.digicode}</strong>
                      </td>
                    </tr>
                    <tr><td style="height: 10px;"></td></tr>
                    <tr>
                      <td style="padding: 12px; background: white; border-radius: 4px; margin-bottom: 8px;">
                        <span style="color: #666;">Code Alarme - Désactivation (en arrivant)</span><br>
                        <strong style="font-size: 24px; color: #1a472a; font-family: monospace;">${codes.alarmOff}</strong>
                      </td>
                    </tr>
                    <tr><td style="height: 10px;"></td></tr>
                    <tr>
                      <td style="padding: 12px; background: white; border-radius: 4px;">
                        <span style="color: #666;">Code Alarme - Activation (en partant)</span><br>
                        <strong style="font-size: 24px; color: #1a472a; font-family: monospace;">${codes.alarmOn}</strong>
                      </td>
                    </tr>
                  </table>
                </div>

                <div style="background: white; border-radius: 8px; padding: 20px;">
                  <h4 style="color: #1a472a; margin-top: 0;">📋 Rappels importants</h4>
                  <ul style="color: #374151; padding-left: 20px;">
                    <li>Pensez à désactiver l'alarme en entrant</li>
                    <li>Réactivez l'alarme en partant</li>
                    <li>Laissez la salle propre et rangée</li>
                    <li>Éteignez les lumières</li>
                  </ul>
                </div>
              </div>

              <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
                <p>Bonne partie ! 🎱</p>
                <p>L'équipe de L'Edorat 8 Pool</p>
              </div>
            </div>
          `,
        });

        console.log(`Confirmation email sent for booking ${bookingId}`);
        return { success: true };
      } catch (error) {
        console.error("Error sending confirmation email:", error);
        return { success: false, error: error.message };
      }
    }

    // Booking cancelled by user
    if (afterData.status === "cancelled" && beforeData.status !== "cancelled") {
      try {
        await resend.emails.send({
          from: "L'Edorat 8 Pool <onboarding@resend.dev>",
          to: [adminEmail.value()],
          subject: `🚫 Réservation annulée - ${afterData.userName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #6b7280; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">L'Edorat 8 Pool</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Réservation annulée par le membre</p>
              </div>

              <div style="padding: 30px; background: #f5f5f5;">
                <div style="background: white; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
                  <h2 style="color: #6b7280; margin-top: 0;">🚫 Annulation de réservation</h2>
                  <p style="color: #666;">${afterData.userName} a annulé sa réservation.</p>

                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Membre</td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">${afterData.userName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Date prévue</td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${formatDateFr(startTime)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Fin prévue</td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${formatDateFr(endTime)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #666;">Billard</td>
                      <td style="padding: 10px 0;">${afterData.billiardName}</td>
                    </tr>
                  </table>
                </div>

                <p style="color: #666; text-align: center; font-size: 14px;">
                  Le créneau est maintenant disponible pour d'autres réservations.
                </p>
              </div>

              <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
                <p>Cet email a été envoyé automatiquement par le Hub de L'Edorat 8 Pool</p>
              </div>
            </div>
          `,
        });

        console.log(`Cancellation email sent for booking ${bookingId}`);
        return { success: true };
      } catch (error) {
        console.error("Error sending cancellation email:", error);
        return { success: false, error: error.message };
      }
    }

    // Booking refused
    if (afterData.status === "refused") {
      try {
        // Create in-app notification
        await db.collection("notifications").add({
          userId: afterData.userId,
          type: "booking_refused",
          title: "Réservation refusée",
          message: afterData.adminComment
            ? `Votre réservation du ${formatDateFr(startTime)} a été refusée: ${afterData.adminComment}`
            : `Votre réservation du ${formatDateFr(startTime)} a été refusée.`,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          bookingId: bookingId,
        });

        await resend.emails.send({
          from: "L'Edorat 8 Pool <onboarding@resend.dev>",
          to: [afterData.userEmail],
          subject: `❌ Réservation refusée - ${formatDateFr(startTime)}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1a472a; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">L'Edorat 8 Pool</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Réservation refusée</p>
              </div>

              <div style="padding: 30px; background: #f5f5f5;">
                <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
                  <h2 style="color: #dc2626; margin: 0;">Votre réservation n'a pas pu être acceptée</h2>
                </div>

                <div style="background: white; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
                  <h3 style="color: #1a472a; margin-top: 0;">Détails de la demande</h3>

                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Date demandée</td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${formatDateFr(startTime)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Billard</td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${afterData.billiardName}</td>
                    </tr>
                    ${afterData.adminComment ? `
                    <tr>
                      <td style="padding: 10px 0; color: #666;">Motif du refus</td>
                      <td style="padding: 10px 0; font-style: italic;">${afterData.adminComment}</td>
                    </tr>
                    ` : ""}
                  </table>
                </div>

                <div style="text-align: center;">
                  <p style="color: #666;">Vous pouvez faire une nouvelle demande pour un autre créneau.</p>
                  <a href="https://poolvitrine-682aa-hub.web.app/reservations"
                     style="display: inline-block; background: #1a472a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Faire une nouvelle réservation
                  </a>
                </div>
              </div>

              <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
                <p>L'équipe de L'Edorat 8 Pool</p>
              </div>
            </div>
          `,
        });

        console.log(`Refusal email sent for booking ${bookingId}`);
        return { success: true };
      } catch (error) {
        console.error("Error sending refusal email:", error);
        return { success: false, error: error.message };
      }
    }

    return null;
  }
);

/**
 * Triggered when a new incident is created
 * Sends alert email to admin
 */
exports.onIncidentCreated = onDocumentCreated(
  {
    document: "incidents/{incidentId}",
    secrets: [resendApiKey, adminEmail],
  },
  async (event) => {
    const incident = event.data.data();
    const incidentId = event.params.incidentId;

    try {
      const resend = new Resend(resendApiKey.value());

      const categoryLabels = {
        billiard_damage: "Dommage sur un billard",
        equipment: "Équipement défectueux",
        cleanliness: "Propreté",
        security: "Sécurité",
        other: "Autre",
      };

      await resend.emails.send({
        from: "L'Edorat 8 Pool <onboarding@resend.dev>",
        to: [adminEmail.value()],
        subject: `⚠️ Signalement d'incident - ${incident.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">⚠️ Signalement d'incident</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">L'Edorat 8 Pool</p>
            </div>

            <div style="padding: 30px; background: #f5f5f5;">
              <div style="background: white; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
                <h2 style="color: #dc2626; margin-top: 0;">${incident.title}</h2>

                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Signalé par</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">${incident.userName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Email</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${incident.userEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Catégorie</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${categoryLabels[incident.category] || incident.category}</td>
                  </tr>
                  ${incident.billiardId ? `
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Billard concerné</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${incident.billiardId}</td>
                  </tr>
                  ` : ""}
                  <tr>
                    <td style="padding: 10px 0; color: #666; vertical-align: top;">Description</td>
                    <td style="padding: 10px 0;">${incident.description}</td>
                  </tr>
                </table>

                ${incident.photos && incident.photos.length > 0 ? `
                <div style="margin-top: 20px;">
                  <h4 style="color: #666;">Photos jointes (${incident.photos.length})</h4>
                  <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${incident.photos.map((url, i) => `
                      <a href="${url}" target="_blank" style="display: block;">
                        <img src="${url}" alt="Photo ${i + 1}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">
                      </a>
                    `).join("")}
                  </div>
                </div>
                ` : ""}
              </div>
            </div>

            <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>Cet email a été envoyé automatiquement par le Hub de L'Edorat 8 Pool</p>
            </div>
          </div>
        `,
      });

      console.log(`Incident alert email sent for incident ${incidentId}`);
      return { success: true };
    } catch (error) {
      console.error("Error sending incident email:", error);
      return { success: false, error: error.message };
    }
  }
);
