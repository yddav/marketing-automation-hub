/**
 * Email Provider Abstraction Layer
 * Supports: Resend (primary), Brevo (migration ready)
 * Allows seamless switching between providers
 */

class EmailProvider {
  constructor(provider = 'resend') {
    this.provider = provider;
    this.initializeProvider();
  }

  initializeProvider() {
    switch (this.provider) {
      case 'resend':
        this.client = this.initializeResend();
        break;
      case 'brevo':
        this.client = this.initializeBrevo();
        break;
      default:
        throw new Error(`Unknown email provider: ${this.provider}`);
    }
  }

  initializeResend() {
    const { Resend } = require('resend');

    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable not set');
    }

    return new Resend(process.env.RESEND_API_KEY);
  }

  initializeBrevo() {
    const SibApiV3Sdk = require('sib-api-v3-sdk');

    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY environment variable not set');
    }

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    return new SibApiV3Sdk.TransactionalEmailsApi();
  }

  /**
   * Send email - unified interface for all providers
   */
  async sendEmail({ from, to, subject, html, text, tags = [] }) {
    switch (this.provider) {
      case 'resend':
        return await this.sendWithResend({ from, to, subject, html, text, tags });
      case 'brevo':
        return await this.sendWithBrevo({ from, to, subject, html, text, tags });
      default:
        throw new Error(`Provider ${this.provider} not implemented`);
    }
  }

  /**
   * Resend implementation
   */
  async sendWithResend({ from, to, subject, html, text, tags }) {
    try {
      const result = await this.client.emails.send({
        from,
        to,
        subject,
        html,
        text,
        tags: tags.map(tag => ({
          name: typeof tag === 'string' ? 'tag' : tag.name,
          value: typeof tag === 'string' ? tag : tag.value
        }))
      });

      return {
        success: true,
        provider: 'resend',
        messageId: result.data.id,
        response: result
      };
    } catch (error) {
      console.error('Resend send error:', error);
      return {
        success: false,
        provider: 'resend',
        error: error.message,
        details: error
      };
    }
  }

  /**
   * Brevo implementation (migration ready)
   */
  async sendWithBrevo({ from, to, subject, html, text, tags }) {
    try {
      // Parse from address
      const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/) || [null, from, from];
      const fromName = fromMatch[1].trim();
      const fromEmail = fromMatch[2].trim();

      const sendSmtpEmail = {
        sender: { name: fromName, email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
        tags: tags.map(tag => typeof tag === 'string' ? tag : tag.value)
      };

      const result = await this.client.sendTransacEmail(sendSmtpEmail);

      return {
        success: true,
        provider: 'brevo',
        messageId: result.messageId,
        response: result
      };
    } catch (error) {
      console.error('Brevo send error:', error);
      return {
        success: false,
        provider: 'brevo',
        error: error.message,
        details: error
      };
    }
  }

  /**
   * Get provider-specific tracking URL
   */
  getTrackingPixelUrl(messageId) {
    const baseUrl = process.env.NETLIFY_URL || 'https://hub.untrapd.com';
    return `${baseUrl}/.netlify/functions/email-tracking?event=open&id=${messageId}`;
  }

  /**
   * Get provider-specific click tracking URL
   */
  getClickTrackingUrl(messageId, destinationUrl) {
    const baseUrl = process.env.NETLIFY_URL || 'https://hub.untrapd.com';
    return `${baseUrl}/.netlify/functions/email-tracking?event=click&id=${messageId}&url=${encodeURIComponent(destinationUrl)}`;
  }
}

module.exports = EmailProvider;
