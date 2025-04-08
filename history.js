document.addEventListener('DOMContentLoaded', () => {
  const backButton = document.getElementById('back-button');
  const historyList = document.getElementById('history-list');
  const clearAllBtn = document.getElementById('clear-all-btn');
  
  // Charger l'historique des analyses
  loadHistory();
  
  // Gestionnaire d'événement pour le bouton retour
  backButton.addEventListener('click', () => {
    window.close();
  });
  
  // Gestionnaire d'événement pour effacer tout l'historique
  clearAllBtn.addEventListener('click', () => {
    if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique des analyses ?')) {
      chrome.storage.local.set({ analysisHistory: {} }, () => {
        loadHistory(); // Recharger la liste vide
      });
    }
  });
  
  // Fonction pour charger l'historique
  function loadHistory() {
    chrome.storage.local.get(['analysisHistory'], (result) => {
      const history = result.analysisHistory || {};
      
      // Effacer la liste actuelle
      historyList.innerHTML = '';
      
      // Si l'historique est vide
      if (Object.keys(history).length === 0) {
        historyList.innerHTML = '<div class="no-history">Aucune analyse n\'a été sauvegardée.</div>';
        clearAllBtn.disabled = true;
        return;
      }
      
      // Trier les entrées par date (plus récentes d'abord)
      const sortedEntries = Object.entries(history)
        .sort((a, b) => new Date(b[1].date) - new Date(a[1].date));
      
      // Créer une entrée pour chaque analyse
      for (const [hostname, analysis] of sortedEntries) {
        const entry = document.createElement('div');
        entry.className = 'history-entry';
        
        const date = new Date(analysis.date).toLocaleString();
        const previewText = analysis.originalText || 'Aucun aperçu disponible';
        const service = analysis.service || 'OpenAI';
        
        entry.innerHTML = `
          <div class="site">${hostname}</div>
          <div class="date">Analysé le ${date} via ${service}</div>
          <div class="preview">"${previewText}"</div>
          <div class="history-actions">
            <button class="view-btn">Voir l'analyse</button>
            <button class="delete-btn">Supprimer</button>
          </div>
        `;
        
        // Ajouter des gestionnaires d'événements aux boutons
        const viewBtn = entry.querySelector('.view-btn');
        const deleteBtn = entry.querySelector('.delete-btn');
        
        // Gestionnaire pour afficher l'analyse
        viewBtn.addEventListener('click', () => {
          chrome.storage.local.set({ currentAnalysis: analysis }, () => {
            const resultsUrl = chrome.runtime.getURL('results.html');
            chrome.tabs.create({ url: resultsUrl });
          });
        });
        
        // Gestionnaire pour supprimer l'analyse
        deleteBtn.addEventListener('click', () => {
          if (confirm(`Êtes-vous sûr de vouloir supprimer l'analyse pour ${hostname} ?`)) {
            chrome.storage.local.get(['analysisHistory'], (result) => {
              const updatedHistory = result.analysisHistory || {};
              delete updatedHistory[hostname];
              
              chrome.storage.local.set({ analysisHistory: updatedHistory }, () => {
                entry.remove();
                
                // Si l'historique est vide après la suppression
                if (Object.keys(updatedHistory).length === 0) {
                  historyList.innerHTML = '<div class="no-history">Aucune analyse n\'a été sauvegardée.</div>';
                  clearAllBtn.disabled = true;
                }
              });
            });
          }
        });
        
        historyList.appendChild(entry);
      }
    });
  }
}); 