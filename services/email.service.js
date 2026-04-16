const nodemailer = require("nodemailer");
const config = require("../config/config");

const transporter = nodemailer.createTransport({
  host: config.email?.host || "smtp.gmail.com",
  port: config.email?.port || 587,
  secure: false,
  auth: {
    user: config.email?.user,
    pass: config.email?.pass,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!config.email?.user || !config.email?.pass) {
      console.warn("Email not configured. Skipping email send.");
      return { sent: false, reason: "Email not configured" };
    }

    await transporter.sendMail({
      from: `"${config.email?.fromName || "Formation Center"}" <${config.email?.user}>`,
      to,
      subject,
      html,
    });

    return { sent: true };
  } catch (error) {
    console.error("Email send error:", error.message);
    return { sent: false, reason: error.message };
  }
};

const sendPaymentPendingNotification = async (responsable, payment, formation, apprenant) => {
  const subject = `Nouveau paiement en attente - ${formation?.titre || "Formation"}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Nouveau paiement en attente</h2>
      <p>Un nouveau paiement nécessite votre vérification.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Formation:</strong> ${formation?.titre || "N/A"}</p>
        <p><strong>Apprenant:</strong> ${apprenant?.prenom} ${apprenant?.nom}</p>
        <p><strong>Montant:</strong> ${payment?.montant || 0} TND</p>
        <p><strong>Méthode:</strong> ${payment?.methodePaiement || "N/A"}</p>
      </div>
      
      <p>Veuillez vous connecter à votre tableau de bord pour confirmer ou rejeter ce paiement.</p>
      <p>Cordialement,<br>L'équipe Formation Center</p>
    </div>
  `;

  return sendEmail({ to: responsable?.email, subject, html });
};

const sendPaymentConfirmedNotification = async (apprenant, payment, formation) => {
  const subject = `Paiement confirmé - ${formation?.titre || "Formation"}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">Paiement confirmé !</h2>
      <p>Félicitations ! Votre paiement a été confirmé.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Formation:</strong> ${formation?.titre || "N/A"}</p>
        <p><strong>Montant:</strong> ${payment?.montant || 0} TND</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString("fr-FR")}</p>
      </div>
      
      <p>Vous avez maintenant accès à la formation. Bonne formation !</p>
      <p>Cordialement,<br>L'équipe Formation Center</p>
    </div>
  `;

  return sendEmail({ to: apprenant?.email, subject, html });
};

const sendInscriptionAcceptedNotification = async (apprenant, formation) => {
  const subject = `Inscription acceptée - ${formation?.titre || "Formation"}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">Inscription acceptée !</h2>
      <p>Félicitations ! Votre inscription a été acceptée.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Formation:</strong> ${formation?.titre || "N/A"}</p>
        <p><strong>Centre:</strong> ${formation?.centreId?.nom || "N/A"}</p>
      </div>
      
      <p>Vous avez maintenant accès à la formation. Bonne formation !</p>
      <p>Cordialement,<br>L'équipe Formation Center</p>
    </div>
  `;

  return sendEmail({ to: apprenant?.email, subject, html });
};

module.exports = {
  sendEmail,
  sendPaymentPendingNotification,
  sendPaymentConfirmedNotification,
  sendInscriptionAcceptedNotification,
};
