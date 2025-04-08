document.addEventListener('DOMContentLoaded', () => {
  const backButton = document.getElementById('back-button');
  const resultsDiv = document.getElementById('results');
  const siteUrlSpan = document.getElementById('site-url');
  const analysisDateSpan = document.getElementById('analysis-date');
  const copyButton = document.getElementById('copy-button');
  const saveButton = document.getElementById('save-button');
  
  // Récupérer les données d'analyse depuis le stockage local temporaire
  chrome.storage.local.get(['currentAnalysis'], (result) => {
    if (result.currentAnalysis) {
      const { content, url, date, hostname } = result.currentAnalysis;
      
      // Afficher les résultats
      resultsDiv.innerHTML = content;
      
      // Afficher les informations du site
      siteUrlSpan.textContent = hostname || url;
      analysisDateSpan.textContent = new Date(date).toLocaleString();
      
      // Ajouter l'URL dans les attributs de données pour la sauvegarde
      saveButton.setAttribute('data-url', url);
      saveButton.setAttribute('data-hostname', hostname);
      
      // Formatage du contenu pour le bouton de copie
      copyButton.setAttribute('data-content', convertHtmlToText(content));
    } else {
      resultsDiv.innerHTML = '<p>Aucun résultat disponible. Veuillez retourner à l\'analyseur.</p>';
      copyButton.disabled = true;
      saveButton.disabled = true;
    }
  });
  
  // Gestionnaire d'événement pour le bouton retour
  backButton.addEventListener('click', () => {
    window.history.back();
  });
  
  // Gestionnaire d'événement pour le bouton de copie
  copyButton.addEventListener('click', () => {
    const textContent = copyButton.getAttribute('data-content');
    
    // Copier le texte dans le presse-papiers
    navigator.clipboard.writeText(textContent)
      .then(() => {
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copié !';
        setTimeout(() => {
          copyButton.textContent = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error('Erreur lors de la copie :', err);
        alert('Impossible de copier le texte. Veuillez réessayer.');
      });
  });
  
  // Gestionnaire d'événement pour le bouton de sauvegarde
  saveButton.addEventListener('click', () => {
    const url = saveButton.getAttribute('data-url');
    const hostname = saveButton.getAttribute('data-hostname');
    
    // Récupérer l'analyse actuelle et la sauvegarder dans l'historique
    chrome.storage.local.get(['currentAnalysis', 'analysisHistory'], (result) => {
      const currentAnalysis = result.currentAnalysis;
      let analysisHistory = result.analysisHistory || {};
      
      // Utiliser le nom d'hôte comme clé pour le stockage
      const key = hostname || url;
      
      // Ajouter ou mettre à jour l'analyse dans l'historique
      analysisHistory[key] = currentAnalysis;
      
      // Sauvegarder l'historique mis à jour
      chrome.storage.local.set({ analysisHistory }, () => {
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Sauvegardé !';
        setTimeout(() => {
          saveButton.textContent = originalText;
        }, 2000);
      });
    });
  });
  
  // Fonction pour convertir le HTML en texte brut pour la copie
  function convertHtmlToText(html) {
    // Créer un élément temporaire
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remplacer les balises <br> par des sauts de ligne
    const brElements = temp.querySelectorAll('br');
    for (const br of brElements) {
      br.replaceWith('\n');
    }
    
    // Remplacer les balises <div class="alert"> par des lignes avec un préfixe d'alerte
    const alertElements = temp.querySelectorAll('.alert');
    for (const alert of alertElements) {
      alert.innerHTML = '⚠️ ' + alert.innerHTML;
    }
    
    // Récupérer le texte
    let text = temp.textContent || temp.innerText || '';
    
    // Nettoyer le texte (supprimer les espaces multiples, etc.)
    text = text
      .replace(/\n+/g, '\n')
      .replace(/\s+/g, ' ')
      .replace(/• /g, '\n• ')
      .trim();
    
    return text;
  }
}); 