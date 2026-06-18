import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private createTransport() {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPasswordReset(to: string, nom: string, token: string) {
    const appUrl = process.env.APP_URL || 'http://localhost:8080';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const transporter = this.createTransport();

    try {
      await transporter.sendMail({
        from: `"AgriTrack" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Réinitialisation de votre mot de passe — AgriTrack',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #4a6a2c;">🌱 AgriTrack</h2>
            <p>Bonjour ${nom},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous (valable <strong>1 heure</strong>) :</p>
            <a href="${resetUrl}"
               style="display:inline-block;background:#5a8236;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
              Réinitialiser mon mot de passe
            </a>
            <p style="color:#888;font-size:13px;">Si vous n'avez pas demandé ce reset, ignorez cet email.</p>
          </div>
        `,
      });
    } catch (err) {
      this.logger.error('Échec envoi email reset', err);
      throw new InternalServerErrorException("Erreur lors de l'envoi de l'email");
    }
  }
}
