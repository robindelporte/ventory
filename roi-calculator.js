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
      salaryWrapper: '[data-roi="salary"]',
      operatorsWrapper: '[data-roi="operators"]',
      
      inventoryValueOutput: '[data-roi="inventory-value"]',
      savingsOutput: '[data-roi="savings"]',
      monthlySavingsOutput: '[data-roi="monthly-savings"]',
      planOutput: '[data-roi="plan"]',
      planPriceOutput: '[data-roi="plan-price"]',
      buttonOutput: '[data-roi="action-button"]',
      trialButtonOutput: 'a[href="/get-in-touch"]'
    },
    urls: {
      freeTrial: 'https://app.ventory.io/signup',
      contactSales: 'https://www.ventory.io/get-in-touch'
    }
  };
  
  // Valeurs actuelles
  var values = {
    skuCount: 998,
    itemValue: 100,
    salary: 2000,
    operators: 1   // Nombre d'opérateurs par défaut
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
    elements.displays.salary = document.querySelector(config.selectors.salaryWrapper + ' [fs-rangeslider-element="display-value"]');
    elements.displays.operators = document.querySelector(config.selectors.operatorsWrapper + ' [fs-rangeslider-element="display-value"]');
    
    // Éléments de sortie
    elements.outputs.inventoryValue = document.querySelectorAll(config.selectors.inventoryValueOutput);
    elements.outputs.savings = document.querySelectorAll(config.selectors.savingsOutput);
    elements.outputs.monthlySavings = document.querySelectorAll(config.selectors.monthlySavingsOutput);
    elements.outputs.plan = document.querySelectorAll(config.selectors.planOutput);
    elements.outputs.planPrice = document.querySelectorAll(config.selectors.planPriceOutput);
    elements.outputs.button = document.querySelectorAll(config.selectors.buttonOutput);
    elements.outputs.trialButton = document.querySelectorAll(config.selectors.trialButtonOutput);
    
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
    
    if (elements.displays.salary) {
      values.salary = parseValue(elements.displays.salary.textContent);
    }
    
    if (elements.displays.operators) {
      values.operators = parseValue(elements.displays.operators.textContent);
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
    
    // Nouvelle formule de calcul des économies:
    // (35% x valeur totale du stock x 20%) + (30% x salaire mensuel x nombre d'opérateurs)
    var totalSalary = values.salary * values.operators;
    var adjustedInventoryValue = inventoryValue * 0.20; // Prendre 20% de la valeur du stock
    var savings = (0.35 * adjustedInventoryValue) + (0.3 * totalSalary);
    
    // Économies mensuelles = économies - prix du plan
    var monthlySavings = savings - plan.price;
    
    // Mettre à jour l'interface
    updateOutputs(inventoryValue, plan, savings, monthlySavings);
  }
  
  // Mettre à jour les sorties
  function updateOutputs(inventoryValue, plan, savings, monthlySavings) {
    var needSalesContact = values.skuCount > 7500;
    
    // Mettre à jour la valeur d'inventaire
    elements.outputs.inventoryValue.forEach(function(el) {
      el.textContent = formatCurrency(inventoryValue);
    });
    
    // Mettre à jour les économies (le montant total d'économies)
    elements.outputs.savings.forEach(function(el) {
      el.textContent = formatCurrency(savings);
    });
    
    // Mettre à jour le nom du plan
    elements.outputs.plan.forEach(function(el) {
      // Si c'est le plan "Speak to our sales team", laisser vide
      el.textContent = (plan.name === 'Speak to our sales team') ? '' : plan.name;
    });
    
    // Mettre à jour le prix du plan
    elements.outputs.planPrice.forEach(function(el) {
      el.textContent = plan.price > 0 ? formatCurrency(plan.price) : 'Contact Sales';
    });
    
    // Mettre à jour les économies mensuelles
    elements.outputs.monthlySavings.forEach(function(el) {
      el.textContent = needSalesContact ? 'Contact Sales' : formatCurrency(monthlySavings);
    });
    
    // Mettre à jour le texte et l'URL du bouton de démarrage d'essai
    elements.outputs.trialButton.forEach(function(el) {
      // Mettre à jour le texte
      var textElement = el.querySelector('.text-btn');
      if (textElement) {
        textElement.textContent = needSalesContact ? 'Contact Sales' : 'Start your free trial';
      }
      
      // Mettre à jour l'URL
      el.href = needSalesContact ? config.urls.contactSales : config.urls.freeTrial;
    });
  }
  
  // Démarrer le calculateur
  init();
})();
