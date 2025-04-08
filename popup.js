document.addEventListener('DOMContentLoaded', () => {
  // Éléments DOM pour les clés API
  const openaiKeyInput = document.getElementById('openai-api-key');
  const saveOpenaiKeyBtn = document.getElementById('save-openai-key');
  const openaiKeyStatus = document.getElementById('openai-key-status');
  const deepseekKeyInput = document.getElementById('deepseek-api-key');
  const saveDeepseekKeyBtn = document.getElementById('save-deepseek-key');
  const deepseekKeyStatus = document.getElementById('deepseek-key-status');
  const apiServiceSelect = document.getElementById('api-service-select');
  
  // Éléments DOM pour l'interface
  const termsTextarea = document.getElementById('terms-text');
  const analyzeButton = document.getElementById('analyze-button');
  const extractButton = document.getElementById('extract-button');
  const loadingDiv = document.getElementById('loading');
  const resultsContainer = document.getElementById('results-container');
  const resultsDiv = document.getElementById('results');
  const historyButton = document.getElementById('history-button');
  
  // Gestion des onglets
  const tabs = document.querySelectorAll('.tab');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Désactiver tous les onglets
      tabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      // Activer l'onglet cliqué
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
      
      // Mettre à jour le sélecteur de service en fonction de l'onglet actif
      apiServiceSelect.value = tabId;
    });
  });
  
  // Synchroniser le sélecteur de service avec les onglets
  apiServiceSelect.addEventListener('change', () => {
    const selectedService = apiServiceSelect.value;
    // Activer l'onglet correspondant
    tabs.forEach(t => t.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));
    
    document.querySelector(`.tab[data-tab="${selectedService}"]`).classList.add('active');
    document.getElementById(`${selectedService}-tab`).classList.add('active');
  });
  
  // Charger les clés API depuis le stockage
  chrome.storage.sync.get(['openai_api_key', 'deepseek_api_key', 'selected_service'], (result) => {
    if (result.openai_api_key) {
      openaiKeyInput.value = result.openai_api_key;
      openaiKeyStatus.textContent = 'Clé API sauvegardée';
      openaiKeyStatus.className = 'status success';
    }
    
    if (result.deepseek_api_key) {
      deepseekKeyInput.value = result.deepseek_api_key;
      deepseekKeyStatus.textContent = 'Clé API sauvegardée';
      deepseekKeyStatus.className = 'status success';
    }
    
    // Restaurer le service sélectionné
    if (result.selected_service) {
      apiServiceSelect.value = result.selected_service;
      
      // Activer l'onglet correspondant
      tabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      document.querySelector(`.tab[data-tab="${result.selected_service}"]`).classList.add('active');
      document.getElementById(`${result.selected_service}-tab`).classList.add('active');
    }
  });

  // Sauvegarder la clé API OpenAI
  saveOpenaiKeyBtn.addEventListener('click', () => {
    const apiKey = openaiKeyInput.value.trim();
    
    if (apiKey === '') {
      openaiKeyStatus.textContent = 'Veuillez entrer une clé API valide';
      openaiKeyStatus.className = 'status error';
      return;
    }
    
    chrome.storage.sync.set({ openai_api_key: apiKey }, () => {
      openaiKeyStatus.textContent = 'Clé API sauvegardée avec succès';
      openaiKeyStatus.className = 'status success';
    });
  });
  
  // Sauvegarder la clé API Deepseek
  saveDeepseekKeyBtn.addEventListener('click', () => {
    const apiKey = deepseekKeyInput.value.trim();
    
    if (apiKey === '') {
      deepseekKeyStatus.textContent = 'Veuillez entrer une clé API valide';
      deepseekKeyStatus.className = 'status error';
      return;
    }
    
    chrome.storage.sync.set({ deepseek_api_key: apiKey }, () => {
      deepseekKeyStatus.textContent = 'Clé API sauvegardée avec succès';
      deepseekKeyStatus.className = 'status success';
    });
  });
  
  // Sauvegarder le service sélectionné
  apiServiceSelect.addEventListener('change', () => {
    const selectedService = apiServiceSelect.value;
    chrome.storage.sync.set({ selected_service: selectedService });
  });

  // Extraire automatiquement les conditions générales
  extractButton.addEventListener('click', () => {
    // Obtenir l'onglet actif
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        termsTextarea.value = "Erreur: Impossible d'accéder à l'onglet actif.";
        return;
      }
      
      const activeTab = tabs[0];
      
      // Afficher un message de chargement dans la zone de texte
      termsTextarea.value = 'Recherche des conditions générales...';
      
      try {
        // Envoyer un message au content script avec timeout pour éviter les blocages
        const messageTimeout = setTimeout(() => {
          termsTextarea.value = "Erreur: Délai d'attente dépassé. Vérifiez que vous êtes sur une page web standard (et non une page chrome:// ou une page d'extension).";
        }, 5000);
        
        chrome.tabs.sendMessage(activeTab.id, { action: 'extractTerms' }, (response) => {
          clearTimeout(messageTimeout);
          
          if (chrome.runtime.lastError) {
            console.error("Erreur:", chrome.runtime.lastError);
            termsTextarea.value = `Erreur: ${chrome.runtime.lastError.message || "Impossible de communiquer avec la page"}\n\nSi c'est la première fois que vous utilisez l'extension sur cette page, essayez de recharger la page et réessayez.`;
            return;
          }
          
          if (response && response.text) {
            termsTextarea.value = response.text;
            
            // Si le texte est trop long, avertir l'utilisateur
            if (response.text.length > 8000) {
              termsTextarea.value += "\n\n⚠️ ATTENTION: Le texte extrait est très long et sera tronqué lors de l'analyse. Considérez de sélectionner uniquement les parties les plus pertinentes.";
              termsTextarea.classList.add('with-warning');
            } else {
              termsTextarea.classList.remove('with-warning');
            }

            // Rendre les liens cliquables si le texte contient des liens
            if (response.text.includes('Liens vers les conditions générales trouvés')) {
              // Ajouter une instruction pour l'utilisateur
              termsTextarea.value += "\n\nCliquez sur un lien ci-dessus pour ouvrir les conditions générales dans un nouvel onglet, puis copiez-collez le texte ici.";
            }
          } else {
            termsTextarea.value = 'Aucune condition générale trouvée automatiquement. Veuillez copier-coller manuellement le texte des conditions générales.';
            termsTextarea.classList.remove('with-warning');
          }
        });
      } catch (error) {
        termsTextarea.value = `Erreur lors de l'extraction: ${error.message}`;
      }
    });
  });

  // Analyser les conditions générales
  analyzeButton.addEventListener('click', async () => {
    const termsText = termsTextarea.value.trim();
    const selectedService = apiServiceSelect.value;
    let apiKey = '';
    
    // Récupérer la clé API correspondante
    if (selectedService === 'openai') {
      apiKey = openaiKeyInput.value.trim();
    } else if (selectedService === 'deepseek') {
      apiKey = deepseekKeyInput.value.trim();
    }
    
    if (termsText === '') {
      alert('Veuillez entrer le texte des conditions générales');
      return;
    }
    
    if (apiKey === '') {
      alert(`Veuillez entrer une clé API ${selectedService === 'openai' ? 'OpenAI' : 'Deepseek'}`);
      return;
    }
    
    // Récupérer l'URL de l'onglet actif
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length === 0) return;
      
      const activeTab = tabs[0];
      const url = activeTab.url;
      let hostname = "";
      
      try {
        // Extraire le nom d'hôte de l'URL
        const urlObj = new URL(url);
        hostname = urlObj.hostname;
      } catch (e) {
        console.error("Erreur lors de l'extraction du nom d'hôte:", e);
      }
      
      // Afficher le chargement
      loadingDiv.classList.remove('hidden');
      resultsContainer.classList.add('hidden');
      
      try {
        let summary;
        if (selectedService === 'openai') {
          summary = await analyzeTermsWithOpenAI(termsText, apiKey);
        } else if (selectedService === 'deepseek') {
          summary = await analyzeTermsWithDeepseek(termsText, apiKey);
        }
        
        // Formater les résultats
        const formattedContent = formatResults(summary);
        
        // Créer un objet avec les informations d'analyse
        const analysisData = {
          content: formattedContent,
          url: url,
          hostname: hostname,
          date: new Date().toISOString(),
          service: selectedService,
          originalText: termsText.substring(0, 100) + "..." // Stocker un aperçu du texte original
        };
        
        // Sauvegarder temporairement les résultats dans le stockage local
        chrome.storage.local.set({ currentAnalysis: analysisData }, () => {
          // Ouvrir la page de résultats dans un nouvel onglet
          const resultsUrl = chrome.runtime.getURL('results.html');
          chrome.tabs.create({ url: resultsUrl });
        });
      } catch (error) {
        alert(`Erreur lors de l'analyse: ${error.message}`);
        loadingDiv.classList.add('hidden');
      }
    });
  });

  // Vérifier s'il existe une analyse sauvegardée pour le site actuel
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    
    const activeTab = tabs[0];
    let hostname = "";
    
    try {
      // Extraire le nom d'hôte de l'URL
      const urlObj = new URL(activeTab.url);
      hostname = urlObj.hostname;
      
      // Rechercher une analyse sauvegardée pour ce site
      chrome.storage.local.get(['analysisHistory'], (result) => {
        const history = result.analysisHistory || {};
        
        if (history[hostname]) {
          // Ajouter un bouton pour voir l'analyse sauvegardée
          const savedAnalysisBtn = document.createElement('button');
          savedAnalysisBtn.textContent = 'Voir l\'analyse sauvegardée';
          savedAnalysisBtn.className = 'saved-analysis-btn';
          savedAnalysisBtn.addEventListener('click', () => {
            // Récupérer l'analyse sauvegardée et l'afficher dans une nouvelle page
            chrome.storage.local.set({ currentAnalysis: history[hostname] }, () => {
              const resultsUrl = chrome.runtime.getURL('results.html');
              chrome.tabs.create({ url: resultsUrl });
            });
          });
          
          // Ajouter le bouton au début de la section d'analyse
          const analysisSection = document.getElementById('analysis-section');
          const firstElement = analysisSection.children[0];
          analysisSection.insertBefore(savedAnalysisBtn, firstElement.nextSibling);
        }
      });
    } catch (e) {
      console.error("Erreur lors de l'extraction du nom d'hôte:", e);
    }
  });

  // Gestionnaire d'événement pour le bouton d'historique
  historyButton.addEventListener('click', () => {
    const historyUrl = chrome.runtime.getURL('history.html');
    chrome.tabs.create({ url: historyUrl });
  });

  // Fonction pour analyser le texte avec l'API OpenAI
  async function analyzeTermsWithOpenAI(text, apiKey) {
    const maxLength = 8000; // Limiter la taille du texte pour éviter de dépasser les limites de l'API
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    
    const prompt = `
      Analysez les conditions générales suivantes et fournissez un résumé structuré comme suit:

      1. RÉSUMÉ GÉNÉRAL (3-4 points maximum très courts)
      - Point 1
      - Point 2
      
      2. POINTS IMPORTANTS CONCERNANT LA VIE PRIVÉE
      - Point 1
      - Point 2
      
      3. UTILISATION DES DONNÉES
      - Point 1
      - Point 2
      
      4. OBLIGATIONS DE L'UTILISATEUR
      - Point 1
      - Point 2
      
      5. ALERTES IMPORTANTES (s'il y a lieu)
      - Alerte 1
      - Alerte 2
      
      Utilisez des puces pour chaque point et rédigez des phrases courtes et claires.
      Mettez en gras les mots-clés importants.
      
      Conditions générales:
      ${truncatedText}
    `;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un assistant juridique spécialisé dans l\'analyse des conditions générales des sites web. Votre tâche est de simplifier les textes juridiques complexes en points faciles à comprendre.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1200
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erreur lors de l\'appel à l\'API OpenAI');
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Transformer le texte Markdown en HTML pour une meilleure lisibilité
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Transformer **texte** en <strong>texte</strong>
      .replace(/\n\s*-\s/g, '<br>• ')  // Transformer les puces en puces HTML
      .replace(/\n\s*(\d+\.\s)/g, '<br><br><strong>$1</strong>')  // Mettre en gras les titres numérotés
      .replace(/\n\n/g, '<br><br>');  // Remplacer les doubles sauts de ligne par des <br>
  }
  
  // Fonction pour analyser le texte avec l'API Deepseek
  async function analyzeTermsWithDeepseek(text, apiKey) {
    const maxLength = 8000; // Limiter la taille du texte
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    
    const prompt = `
      Analysez les conditions générales suivantes et fournissez un résumé structuré comme suit:

      1. RÉSUMÉ GÉNÉRAL (3-4 points maximum très courts)
      - Point 1
      - Point 2
      
      2. POINTS IMPORTANTS CONCERNANT LA VIE PRIVÉE
      - Point 1
      - Point 2
      
      3. UTILISATION DES DONNÉES
      - Point 1
      - Point 2
      
      4. OBLIGATIONS DE L'UTILISATEUR
      - Point 1
      - Point 2
      
      5. ALERTES IMPORTANTES (s'il y a lieu)
      - Alerte 1
      - Alerte 2
      
      Utilisez des puces pour chaque point et rédigez des phrases courtes et claires.
      Mettez en gras les mots-clés importants.
      
      Conditions générales:
      ${truncatedText}
    `;
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un assistant juridique spécialisé dans l\'analyse des conditions générales des sites web. Votre tâche est de simplifier les textes juridiques complexes en points faciles à comprendre.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1200
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erreur lors de l\'appel à l\'API Deepseek');
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Transformer le texte Markdown en HTML pour une meilleure lisibilité
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Transformer **texte** en <strong>texte</strong>
      .replace(/\n\s*-\s/g, '<br>• ')  // Transformer les puces en puces HTML
      .replace(/\n\s*(\d+\.\s)/g, '<br><br><strong>$1</strong>')  // Mettre en gras les titres numérotés
      .replace(/\n\n/g, '<br><br>');  // Remplacer les doubles sauts de ligne par des <br>
  }

  // Fonction pour formater les résultats de manière plus lisible
  function formatResults(htmlContent) {
    // Mettre en évidence les alertes importantes
    if (htmlContent.includes('<strong>5. ALERTES IMPORTANTES')) {
      const alertsSection = htmlContent.split('<strong>5. ALERTES IMPORTANTES')[1];
      if (alertsSection) {
        const nextSection = alertsSection.includes('<strong>6.') ? 
          alertsSection.split('<strong>6.')[0] : alertsSection;
        
        // Extraire les puces d'alerte
        const alertItems = nextSection.match(/<br>•(.*?)(?=<br>•|<br><br>|$)/g) || [];
        
        // Transformer chaque puce d'alerte en div d'alerte
        for (const alertItem of alertItems) {
          htmlContent = htmlContent.replace(
            alertItem, 
            `<div class="alert">${alertItem.replace('<br>•', '⚠️ ')}</div>`
          );
        }
      }
    }
    
    // Diviser le contenu en sections
    htmlContent = htmlContent.replace(
      /<br><br><strong>(\d+\.\s.*?)<\/strong>/g, 
      '<div class="section"><br><br><strong>$1</strong>'
    );
    htmlContent = htmlContent + '</div>';
    htmlContent = htmlContent.replace('</div></div>', '</div>');
    
    return htmlContent;
  }
}); 