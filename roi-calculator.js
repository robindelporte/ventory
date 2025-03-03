// ROI Calculator for Webflow
(function() {
  // Configuration
  var config = {
    plans: [
      { name: 'Light plan', price: 49, maxSkus: 500 },
      { name: 'Plus plan', price: 149, maxSkus: 2000 },
      { name: 'Max plan', price: 299, maxSkus: 7500 },
      { name: 'Speak to our sales team', price: 0, maxSkus: Infinity }
    ],
    selectors: {
      skuCountWrapper: '[data-roi="sku-count"]',
      itemValueWrapper: '[data-roi="item-value"]',
      locationsWrapper: '[data-roi="locations"]',
      
      inventoryValueOutput: '[data-roi="inventory-value"]',
      savingsOutput: '[data-roi="savings"]',
      planOutput: '[data-roi="plan"]',
      planPriceOutput: '[data-roi="plan-price"]',
      buttonOutput: '[data-roi="action-button"]'
    }
  };
  
  // Valeurs actuelles
  var values = {
    skuCount: 998,
    itemValue: 100,
    locations: 100
  };
  
  // Éléments DOM
  var elements = {
    displays: {},
    outputs: {}
  };
  
  // Initialisation
  function init() {
    console.log("Initializing ROI Calculator");
    window.addEventListener('load', function() {
      getElements();
      setupPolling();
      calculate(); // Calcul initial
    });
  }
  
  // Récupérer les éléments du DOM
  function getElements() {
    // Éléments d'affichage des sliders
    elements.displays.skuCount = document.querySelector(config.selectors.skuCountWrapper + ' [fs-rangeslider-element="display-value"]');
    elements.displays.itemValue = document.querySelector(config.selectors.itemValueWrapper + ' [fs-rangeslider-element="display-value"]');
    elements.displays.locations = document.querySelector(config.selectors.locationsWrapper + ' [fs-rangeslider-element="display-value"]');
    
    // Éléments de sortie
    elements.outputs.inventoryValue = document.querySelectorAll(config.selectors.inventoryValueOutput);
    elements.outputs.savings = document.querySelectorAll(config.selectors.savingsOutput);
    elements.outputs.plan = document.querySelectorAll(config.selectors.planOutput);
    elements.outputs.planPrice = document.querySelectorAll(config.selectors.planPriceOutput);
    elements.outputs.button = document.querySelectorAll(config.selectors.buttonOutput);
    
    console.log("DOM Elements:", elements);
  }
  
  // Mettre en place une vérification périodique
  function setupPolling() {
    // Vérifier les valeurs toutes les 100ms pour une réactivité plus rapide
    setInterval(function() {
      readValues();
      calculate();
    }, 100);
  }
  
  // Lire les valeurs actuelles
  function readValues() {
    if (elements.displays.skuCount) {
      values.skuCount = parseValue(elements.displays.skuCount.textContent);
    }
    
    if (elements.displays.itemValue) {
      values.itemValue = parseValue(elements.displays.itemValue.textContent);
    }
    
    if (elements.displays.locations) {
      values.locations = parseValue(elements.displays.locations.textContent);
    }
    
    console.log("Current values:", values);
  }
  
  // Parser une valeur depuis le texte affiché
  function parseValue(text) {
    if (!text) return 0;
    
    // Nettoyer le texte
    text = text.toString().replace(/[^0-9KMk.,]/g, '');
    
    // Gérer K et M
    if (text.includes('K') || text.includes('k')) {
      return parseFloat(text.replace(/[Kk]/g, '')) * 1000;
    } else if (text.includes('M') || text.includes('m')) {
      return parseFloat(text.replace(/[Mm]/g, '')) * 1000000;
    }
    
    // Gérer les séparateurs
    return parseFloat(text.replace(/\./g, '').replace(',', '.'));
  }
  
  // Formater en devise
  function formatCurrency(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  }
  
  // Déterminer le plan mensuel en fonction du nombre de SKUs
  function determineMonthlyPlan(skus) {
    for (var i = 0; i < config.plans.length; i++) {
      if (skus <= config.plans[i].maxSkus) {
        return config.plans[i];
      }
    }
    
    // Si plus de SKUs que prévu
    return config.plans[config.plans.length - 1];
  }
  
  // Calculer les résultats
  function calculate() {
    console.log("Calculating with:", values);
    
    // Valeur d'inventaire = nombre d'articles * valeur par article
    var inventoryValue = values.skuCount * values.itemValue;
    
    // Déterminer le plan
    var plan = determineMonthlyPlan(values.skuCount);
    
    // Calcul simplifié des économies mensuelles (à adapter selon vos besoins)
    var monthlySavings = values.skuCount > 0 ? Math.round(values.skuCount * 0.35) : 0;
    
    // Mettre à jour l'interface
    updateOutputs(inventoryValue, plan, monthlySavings);
  }
  
  // Mettre à jour les sorties
  function updateOutputs(inventoryValue, plan, monthlySavings) {
    // Mettre à jour la valeur d'inventaire
    elements.outputs.inventoryValue.forEach(function(el) {
      el.textContent = formatCurrency(inventoryValue);
    });
    
    // Mettre à jour le nom du plan
    elements.outputs.plan.forEach(function(el) {
      el.textContent = plan.name;
    });
    
    // Mettre à jour le prix du plan
    elements.outputs.planPrice.forEach(function(el) {
      el.textContent = plan.price > 0 ? formatCurrency(plan.price) : 'Contact Sales';
    });
    
    // Mettre à jour les économies mensuelles
    elements.outputs.savings.forEach(function(el) {
      // Afficher "Contact Sales" si on est sur le dernier plan, sinon afficher le montant
      el.textContent = values.skuCount > 7500 ? 'Contact Sales' : formatCurrency(monthlySavings);
    });
    
    // Mettre à jour le texte du bouton
    elements.outputs.button.forEach(function(el) {
      el.textContent = values.skuCount <= 7500 ? 'Start Your Free Trial' : 'Contact Sales';
    });
  }
  
  // Démarrer le calculateur
  init();
})();
