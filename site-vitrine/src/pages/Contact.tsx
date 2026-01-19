import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import './Contact.css';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Le sujet doit contenir au moins 3 caractères'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitStatus('loading');
    setErrorMessage('');

    try {
      // Call Firebase Cloud Function
      const sendContactEmail = httpsCallable(functions, 'sendContactEmail');
      await sendContactEmail(data);

      setSubmitStatus('success');
      reset();

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Error sending contact form:', error);
      setSubmitStatus('error');
      setErrorMessage(
        'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer ou nous contacter directement par email.'
      );
    }
  };

  return (
    <div className="contact-page">
      <h1>Contactez-nous</h1>
      <p className="contact-intro">
        Une question ? Une demande de renseignement ? N'hésitez pas à nous
        contacter, nous vous répondrons dans les plus brefs délais.
      </p>

      <div className="contact-container">
        {/* Contact Form */}
        <div className="contact-form-section">
          <h2>Envoyez-nous un message</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">
                Nom complet <span className="required">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className={errors.name ? 'error' : ''}
                disabled={submitStatus === 'loading'}
              />
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'error' : ''}
                disabled={submitStatus === 'loading'}
              />
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Téléphone</label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                disabled={submitStatus === 'loading'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">
                Sujet <span className="required">*</span>
              </label>
              <input
                id="subject"
                type="text"
                {...register('subject')}
                className={errors.subject ? 'error' : ''}
                disabled={submitStatus === 'loading'}
              />
              {errors.subject && (
                <span className="error-message">{errors.subject.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="message">
                Message <span className="required">*</span>
              </label>
              <textarea
                id="message"
                rows={6}
                {...register('message')}
                className={errors.message ? 'error' : ''}
                disabled={submitStatus === 'loading'}
              />
              {errors.message && (
                <span className="error-message">{errors.message.message}</span>
              )}
            </div>

            {submitStatus === 'success' && (
              <div className="alert alert-success">
                Votre message a été envoyé avec succès ! Nous vous répondrons
                dans les plus brefs délais.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="alert alert-error">{errorMessage}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitStatus === 'loading'}
            >
              {submitStatus === 'loading' ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="contact-info-section">
          <h2>Informations de contact</h2>

          <div className="info-card">
            <div className="info-icon">📍</div>
            <div className="info-content">
              <h3>Adresse</h3>
              <p>123 Rue Example<br />75001 Paris<br />France</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📞</div>
            <div className="info-content">
              <h3>Téléphone</h3>
              <p>+33 1 23 45 67 89</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📧</div>
            <div className="info-content">
              <h3>Email</h3>
              <p>contact@ledorat8pool.fr</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">🕒</div>
            <div className="info-content">
              <h3>Horaires d'ouverture</h3>
              <p>
                Lundi - Vendredi: 18h - 23h<br />
                Samedi: 14h - 23h<br />
                Dimanche: 14h - 20h
              </p>
            </div>
          </div>

          <div className="social-section">
            <h3>Suivez-nous</h3>
            <div className="social-links">
              <a href="#" className="social-link facebook" aria-label="Facebook">
                Facebook
              </a>
              <a href="#" className="social-link instagram" aria-label="Instagram">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
