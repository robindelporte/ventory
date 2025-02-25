// ROI Calculator Simple Version
(function() {
  // Configuration
  var config = {
    plans: [
      { name: 'Lite', price: 100, transactions: 500 },
      { name: 'Basic', price: 350, transactions: 1000 },
      { name: 'Core', price: 600, transactions: 2000 },
      { name: 'Business', price: 1250, transactions: 5000 },
      { name: 'Enterprise Basic', price: 2950, transactions: 15000 },
      { name: 'Enterprise Advanced', price: 5900, transactions: 30000 }
    ],
    selectors: {
      skuCountWrapper: '[data-roi="sku-count"]',
      itemValueWrapper: '[data-roi="item-value"]',
      salaryWrapper: '[data-roi="salary"]',
      transactionsWrapper: '[data-roi="transactions"]',
      
      inventoryValueOutput: '[data-roi="inventory-value"]',
      savingsOutput: '[data-roi="savings"]',
      planOutput: '[data-roi="plan"]',
      planPriceOutput: '[data-roi="plan-price"]',
      monthlySavingsOutput: '[data-roi="monthly-savings"]'
    }
  };
  
  // Valeurs actuelles
  var values = {
    skuCount: 1000,
    itemValue: 100,
    salary: 2000,
    transactions: 1000
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
    elements.displays.transactions = document.querySelector(config.selectors.transactionsWrapper + ' [fs-rangeslider-element="display-value"]');
    
    // Éléments de sortie
    elements.outputs.inventoryValue = document.querySelectorAll(config.selectors.inventoryValueOutput);
    elements.outputs.savings = document.querySelectorAll(config.selectors.savingsOutput);
    elements.outputs.plan = document.querySelectorAll(config.selectors.planOutput);
    elements.outputs.planPrice = document.querySelectorAll(config.selectors.planPriceOutput);
    elements.outputs.monthlySavings = document.querySelectorAll(config.selectors.monthlySavingsOutput);
    
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
    
    if (elements.displays.transactions) {
      values.transactions = parseValue(elements.displays.transactions.textContent);
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
  
  // Déterminer le plan mensuel
  function determineMonthlyPlan() {
    for (var i = 0; i < config.plans.length; i++) {
      var plan = config.plans[i];
      if (values.transactions <= plan.transactions) {
        return plan;
      }
    }
    
    // Si plus de transactions que le plus grand plan
    return config.plans[config.plans.length - 1];
  }
  
  // Calculer les résultats
  function calculate() {
    console.log("Calculating with:", values);
    
    // Valeur d'inventaire = nombre d'articles * valeur par article
    var inventoryValue = values.skuCount * values.itemValue;
    
    // Économies = (35% * valeur d'inventaire) + (30% * salaire mensuel)
    var savings = (0.35 * inventoryValue) + (0.3 * values.salary);
    
    // Déterminer le plan
    var plan = determineMonthlyPlan();
    
    // Économies mensuelles = économies - prix du plan
    var monthlySavings = savings - plan.price;
    
    // Mettre à jour l'interface
    updateOutputs(inventoryValue, savings, plan, monthlySavings);
  }
  
  // Mettre à jour les sorties
  function updateOutputs(inventoryValue, savings, plan, monthlySavings) {
    // Mettre à jour la valeur d'inventaire
    elements.outputs.inventoryValue.forEach(function(el) {
      el.textContent = formatCurrency(inventoryValue);
    });
    
    // Mettre à jour les économies
    elements.outputs.savings.forEach(function(el) {
      el.textContent = formatCurrency(savings);
    });
    
    // Mettre à jour le nom du plan
    elements.outputs.plan.forEach(function(el) {
      el.textContent = plan.name;
    });
    
    // Mettre à jour le prix du plan
    elements.outputs.planPrice.forEach(function(el) {
      el.textContent = formatCurrency(plan.price);
    });
    
    // Mettre à jour les économies mensuelles
    elements.outputs.monthlySavings.forEach(function(el) {
      el.textContent = formatCurrency(monthlySavings);
    });
  }
  
  // Démarrer le calculateur
  init();
})();
