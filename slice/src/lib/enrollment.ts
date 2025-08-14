// Fonction utilitaire pour inscrire une entreprise à une séquence
export function enrollCompany(companyName: string) {
  // Déclencher l'événement pour ajouter à la table sequences
  const enrollEvent = new CustomEvent('enrollCompany', {
    detail: { companyName }
  });
  window.dispatchEvent(enrollEvent);
  
  // Déclencher l'événement pour afficher la notification
  const notificationEvent = new CustomEvent('companyEnrolled', {
    detail: { companyName }
  });
  window.dispatchEvent(notificationEvent);
}
