import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    telephone: '', // Changé de 'identifiant' à 'telephone'
    mot_de_passe: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fonction pour formater le numéro de téléphone Niger
  const formatTelephone = (value) => {
    // Enlever tout sauf les chiffres
    let numbers = value.replace(/\D/g, '');
    
    // Si l'utilisateur entre l'indicatif 227, on le garde mais on le traite
    if (numbers.startsWith('227')) {
      numbers = numbers.substring(3);
    }
    
    // Limiter à 8 chiffres (format Niger)
    numbers = numbers.substring(0, 8);
    
    // Formater pour l'affichage (XX XX XX XX)
    if (numbers.length > 6) {
      return numbers.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    } else if (numbers.length > 4) {
      return numbers.replace(/(\d{2})(\d{2})(\d{2})/, '$1 $2 $3');
    } else if (numbers.length > 2) {
      return numbers.replace(/(\d{2})(\d{2})/, '$1 $2');
    }
    return numbers;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telephone') {
      // Appliquer le formatage pour le téléphone
      setFormData({
        ...formData,
        [name]: formatTelephone(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.telephone.trim()) {
      setError('Le numéro de téléphone est requis');
      return false;
    }

    // Nettoyer le téléphone pour validation
    const cleanPhone = formData.telephone.replace(/\s/g, '');
    
    // Validation pour le Niger (8 chiffres commençant par 9)
    if (!/^[9][0-9]{7}$/.test(cleanPhone)) {
      setError('Numéro de téléphone invalide pour le Niger. Format attendu: 90 12 34 56');
      return false;
    }

    // Vérifier les préfixes valides (opérateurs Niger)
    const prefix = cleanPhone.substring(0, 2);
    const operateursValides = ['90', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
    if (!operateursValides.includes(prefix)) {
      setError(`Préfixe invalide. Utilisez un numéro Orange (90-93), Airtel (94-96) ou Moov (97-99)`);
      return false;
    }

    if (!formData.mot_de_passe) {
      setError('Le mot de passe est requis');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation avant envoi
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Nettoyer le téléphone avant envoi (enlever les espaces)
      const cleanPhone = formData.telephone.replace(/\s/g, '');
      
      const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telephone: cleanPhone, // Envoyer seulement le téléphone
          mot_de_passe: formData.mot_de_passe
        })
      });

      const data = await response.json();

      if (data.success) {
        // Stocker les informations de connexion
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirection selon le profil
        if (data.user.profile === 'gestionnaire') {
          navigate('/dashboard'); // Gestionnaire va au dashboard
        } else {
          navigate('/ventes'); // Vendeur va directement aux ventes
        }
      } else {
        setError(data.message || 'Numéro de téléphone ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur. Vérifiez votre connexion.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir le drapeau et l'indicatif
  const getCountryInfo = () => {
    return {
      flag: '🇳🇪',
      code: '+227',
      name: 'Niger'
    };
  };

  const country = getCountryInfo();

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ 
      background: 'linear-gradient(135deg, #006994 0%, #40C4FF 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Motif de vagues en arrière-plan */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="20" viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 10 Q 20 5, 40 10 T 80 10 T 120 10" stroke="rgba(255,255,255,0.1)" fill="none" stroke-width="2"/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat',
        opacity: 0.3,
        pointerEvents: 'none'
      }} />

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            {/* Carte de login */}
            <div className="card border-0" style={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              {/* Header avec logo */}
              <div className="text-center pt-5 pb-3" style={{ backgroundColor: '#F5F5F5' }}>
                <div className="mb-3">
                  {/* Logo avec image */}
                  <img 
                    src="/assets/img/logo1.png" 
                    alt="Poissonnerie Grema" 
                    style={{
                      width: '150px',
                      height: 'auto',
                      marginBottom: '10px'
                    }}
                  />
                </div>
                {/* Petit indicateur Niger */}
                <div className="d-flex justify-content-center align-items-center gap-2">
                  <span style={{ fontSize: '1.2rem' }}>{country.flag}</span>
                  <span style={{ 
                    fontSize: '0.9rem', 
                    color: '#666',
                    fontFamily: 'Roboto, sans-serif'
                  }}>
                    {country.name} - Connexion vendeurs
                  </span>
                </div>
              </div>

              {/* Corps du formulaire */}
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center" style={{
                    borderRadius: '8px',
                    borderLeft: '4px solid #dc3545'
                  }} role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="telephone" className="form-label" style={{
                      fontFamily: 'Roboto, sans-serif',
                      color: '#333333',
                      fontWeight: '500'
                    }}>
                      Numéro de téléphone (Niger)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" style={{
                        backgroundColor: '#F5F5F5',
                        border: '1px solid #ddd',
                        borderRight: 'none',
                        color: '#006994',
                        fontWeight: 'bold'
                      }}>
                        {country.flag} {country.code}
                      </span>
                      <input
                        type="tel"
                        className="form-control"
                        id="telephone"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        style={{
                          fontFamily: 'Roboto, sans-serif',
                          border: '1px solid #ddd',
                          borderLeft: 'none',
                          padding: '10px 15px',
                          borderRadius: '0 8px 8px 0'
                        }}
                        placeholder="90 12 34 56"
                        autoComplete="tel"
                      />
                    </div>
                    {/* Aide pour le format */}
                    <small className="text-muted d-block mt-1">
                      <i className="bi bi-info-circle me-1"></i>
                      Format: 90 12 34 56 (8 chiffres, commence par 9)
                    </small>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="mot_de_passe" className="form-label" style={{
                      fontFamily: 'Roboto, sans-serif',
                      color: '#333333',
                      fontWeight: '500'
                    }}>
                      Mot de passe
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" style={{
                        backgroundColor: '#F5F5F5',
                        border: '1px solid #ddd',
                        borderRight: 'none'
                      }}>
                        <i className="bi bi-lock" style={{ color: '#006994' }}></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="mot_de_passe"
                        name="mot_de_passe"
                        value={formData.mot_de_passe}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        style={{
                          fontFamily: 'Roboto, sans-serif',
                          border: '1px solid #ddd',
                          borderLeft: 'none',
                          borderRight: 'none',
                          padding: '10px 15px'
                        }}
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <span 
                        className="input-group-text" 
                        style={{
                          backgroundColor: '#F5F5F5',
                          border: '1px solid #ddd',
                          borderLeft: 'none',
                          cursor: 'pointer'
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} style={{ color: '#006994' }}></i>
                      </span>
                    </div>
                  </div>

                
                
                  <button 
                    type="submit" 
                    className="btn w-100 py-2 mb-3"
                    disabled={loading}
                    style={{
                      backgroundColor: '#FF6F00',
                      border: 'none',
                      borderRadius: '8px',
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 'bold',
                      color: 'white',
                      transition: 'all 0.3s',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = '#FFB300';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(255,111,0,0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = '#FF6F00';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Connexion...
                      </>
                    ) : 'Se connecter'}
                  </button>

                  {/* Liens utiles */}
                  <div className="text-center">
                    <a 
                      href="/forgot-password" 
                      style={{
                        fontFamily: 'Roboto, sans-serif',
                        color: '#006994',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        transition: 'color 0.3s'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#FF6F00'}
                      onMouseLeave={(e) => e.target.style.color = '#006994'}
                    >
                      Mot de passe oublié ?
                    </a>
                    <span className="mx-2 text-muted">|</span>
                    <span style={{
                      fontFamily: 'Roboto, sans-serif',
                      color: '#666',
                      fontSize: '0.9rem'
                    }}>
                      Besoin d'aide ? Contactez votre gestionnaire
                    </span>
                  </div>
                </form>
              </div>

              {/* Footer avec vague */}
              <div style={{
                height: '20px',
                background: 'linear-gradient(45deg, #006994 0%, #40C4FF 100%)',
                marginTop: 'auto'
              }} />
            </div>

            {/* Message de fraîcheur */}
            <p className="text-center mt-4" style={{
              fontFamily: 'Roboto, sans-serif',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem'
            }}>
              🐟 Poisson frais du jour - Niamey, Niger 🇳🇪
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;