import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
  acceptedRules: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter le règlement intérieur',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptedRules: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      setLoading(true);
      await registerUser(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        acceptedRules: data.acceptedRules,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
      if (errorMessage.includes('email-already-in-use')) {
        setError('Un compte existe déjà avec cet email');
      } else if (errorMessage.includes('weak-password')) {
        setError('Le mot de passe est trop faible');
      } else {
        setError('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Hub Adhérent</h1>
          <h2>Créer un compte</h2>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Prénom</label>
              <input
                type="text"
                id="firstName"
                {...register('firstName')}
                placeholder="Jean"
                disabled={loading}
              />
              {errors.firstName && <span className="error">{errors.firstName.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Nom</label>
              <input
                type="text"
                id="lastName"
                {...register('lastName')}
                placeholder="Dupont"
                disabled={loading}
              />
              {errors.lastName && <span className="error">{errors.lastName.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...register('email')}
              placeholder="votre@email.com"
              disabled={loading}
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Téléphone</label>
            <input
              type="tel"
              id="phone"
              {...register('phone')}
              placeholder="06 12 34 56 78"
              disabled={loading}
            />
            {errors.phone && <span className="error">{errors.phone.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              {...register('password')}
              placeholder="••••••••"
              disabled={loading}
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword')}
              placeholder="••••••••"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <span className="error">{errors.confirmPassword.message}</span>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                {...register('acceptedRules')}
                disabled={loading}
              />
              <span>
                J'accepte le{' '}
                <a href="/reglement" target="_blank" rel="noopener noreferrer">
                  règlement intérieur
                </a>{' '}
                du club
              </span>
            </label>
            {errors.acceptedRules && (
              <span className="error">{errors.acceptedRules.message}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="auth-switch">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
