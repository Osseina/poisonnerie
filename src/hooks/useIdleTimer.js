// hooks/useIdleTimer.js
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const useIdleTimer = (timeout = 30 * 60 * 1000) => { // 30 minutes par défaut
  const navigate = useNavigate();
  const timerRef = useRef();
  const lastActivityRef = useRef(Date.now());

  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      // Si vraiment inactif depuis plus que le timeout
      if (timeSinceLastActivity >= timeout) {
        console.log('⏰ Inactivité détectée, déconnexion...');
        
        // Récupérer le token pour voir s'il existe encore
        const token = localStorage.getItem('token');
        
        if (token) {
          // Nettoyer
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Rediriger
          navigate('/login', { 
            state: { 
              message: 'Déconnecté pour inactivité (30 minutes sans activité)' 
            } 
          });
        }
      }
    }, timeout);
  };

  useEffect(() => {
    // Liste des événements à surveiller
    const events = [
      'mousemove', 'keydown', 'click', 'scroll',
      'touchstart', 'touchmove', 'wheel'
    ];
    
    // Initialiser le timer
    resetTimer();
    
    // Ajouter les écouteurs d'événements
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    
    // Nettoyage
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeout]);

  return resetTimer;
};

export default useIdleTimer;