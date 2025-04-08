// Script qui s'exécute sur les pages web (content script)

// Écouter les messages provenant de la popup ou de l'extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractTerms') {
    const termsText = findTermsOfService();
    sendResponse({ text: termsText });
  }
  return true; // Permet de garder la connexion ouverte pour les réponses asynchrones
});

// Fonction pour tenter de trouver les conditions générales sur la page actuelle
function findTermsOfService() {
  // Liste des éléments potentiels contenant les conditions générales
  const selectors = [
    // Iframes (souvent utilisés pour intégrer les CGU)
    'iframe[src*="terms"]',
    'iframe[src*="conditions"]',
    'iframe[src*="cgu"]',
    'iframe[src*="cgv"]',
    'iframe[src*="legal"]',
    'iframe[src*="privacy"]',
    
    // Divs et sections
    'div[id*="terms"]',
    'div[id*="conditions"]',
    'div[id*="cgu"]',
    'div[id*="cgv"]',
    'div[id*="legal"]',
    'div[id*="privacy"]',
    'div[class*="terms"]',
    'div[class*="conditions"]',
    'div[class*="cgu"]',
    'div[class*="cgv"]',
    'div[class*="legal"]',
    'div[class*="privacy"]',
    'section[id*="terms"]',
    'section[id*="conditions"]',
    'section[id*="cgu"]',
    'section[id*="cgv"]',
    'section[id*="legal"]',
    'section[id*="privacy"]',
    
    // Articles et texte
    'article[id*="terms"]',
    'article[id*="conditions"]',
    'article[id*="cgu"]',
    'article[id*="cgv"]',
    'article[id*="legal"]',
    'article[id*="privacy"]',
    '.terms-of-service',
    '.terms-and-conditions',
    '.conditions-generales',
    '.conditions-utilisation',
    '.mentions-legales',
    '.politique-confidentialite',
    '.privacy-policy',
    '#terms-of-service',
    '#terms-and-conditions',
    '#conditions-generales',
    '#conditions-utilisation',
    '#mentions-legales',
    '#politique-confidentialite',
    '#privacy-policy'
  ];
  
  // Rechercher les éléments sur la page
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      // Prendre le texte du premier élément trouvé
      return elements[0].textContent.trim();
    }
  }
  
  // Si aucun élément spécifique n'est trouvé, chercher des liens vers les conditions générales
  const termsLinks = [
    // Patterns anglais
    'a[href*="terms"]',
    'a[href*="conditions"]',
    'a[href*="legal"]',
    'a[href*="privacy"]',
    
    // Patterns français
    'a[href*="cgu"]',
    'a[href*="cgv"]',
    'a[href*="mentions-legales"]',
    'a[href*="mentions_legales"]',
    'a[href*="politique-confidentialite"]',
    'a[href*="politique_confidentialite"]',
    'a[href*="conditions-generales"]',
    'a[href*="conditions_generales"]',
    'a[href*="conditions-utilisation"]',
    'a[href*="conditions_utilisation"]',
    
    // Textes courants (sélecteurs CSS avancés, peuvent ne pas fonctionner partout)
    'a:contains("Terms")',
    'a:contains("Conditions")',
    'a:contains("Legal")',
    'a:contains("Privacy")',
    'a:contains("CGU")',
    'a:contains("CGV")',
    'a:contains("Mentions légales")',
    'a:contains("Politique de confidentialité")',
    'a:contains("Conditions générales")',
    'a:contains("Conditions d\'utilisation")'
  ];
  
  // Utiliser un Map pour stocker les liens uniques (élimine les doublons)
  const uniqueLinks = new Map();
  
  // Rechercher tous les liens pertinents sur la page
  for (const selector of termsLinks) {
    try {
      const links = document.querySelectorAll(selector);
      if (links.length > 0) {
        for (const link of links) {
          const url = link.href;
          const text = link.textContent.trim();
          
          // Vérifier si le lien n'est pas déjà dans notre collection
          // On utilise l'URL comme clé pour éviter les doublons
          if (!uniqueLinks.has(url) && text && url) {
            uniqueLinks.set(url, text);
          }
        }
      }
    } catch (e) {
      // Ignorer les erreurs de sélecteur non pris en charge
    }
  }
  
  // Si des liens ont été trouvés, les formater pour l'affichage
  if (uniqueLinks.size > 0) {
    let linkTexts = "Liens vers les conditions générales trouvés sur cette page:\n";
    
    // Trier les liens par texte pour un affichage plus cohérent
    const sortedLinks = Array.from(uniqueLinks.entries())
      .sort((a, b) => a[1].localeCompare(b[1]));
      
    for (const [url, text] of sortedLinks) {
      linkTexts += `- ${text}: ${url}\n`;
    }
    
    return linkTexts;
  }
  
  // Rechercher les mentions "conditions générales" dans le texte de la page
  const pageText = document.body.textContent;
  const termsPatterns = [
    "conditions générales", 
    "terms of service", 
    "terms and conditions", 
    "conditions d'utilisation",
    "mentions légales",
    "politique de confidentialité",
    "privacy policy"
  ];
  
  for (const pattern of termsPatterns) {
    if (pageText.toLowerCase().includes(pattern.toLowerCase())) {
      return `Texte contenant "${pattern}" détecté sur la page, mais aucun bloc spécifique n'a pu être isolé. Utilisez Ctrl+F pour rechercher "${pattern}" sur la page et copier le texte pertinent.`;
    }
  }
  
  // Si rien n'est trouvé
  return "Aucune condition générale n'a pu être détectée automatiquement sur cette page. Veuillez copier-coller manuellement le texte des conditions générales.";
} 