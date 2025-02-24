/**
 * ROI Calculator for Ventory
 * Handles calculations for the inventory management ROI tool
 */
class ROICalculator {
  constructor() {
    this.config = {
      plans: [
        { name: 'Lite', price: 100, transactions: 500 },
        { name: 'Basic', price: 350, transactions: 1000 },
        { name: 'Core', price: 600, transactions: 2000 },
        { name: 'Business', price: 1250, transactions: 5000 },
        { name: 'Enterprise Basic', price: 2950, transactions: 15000 },
        { name: 'Enterprise Advanced', price: 5900, transactions: 30000 }
      ],
      selectors: {
        // Input sliders conteneurs
        skuCountSlider: '[data-roi="sku-count"]',
        itemValueSlider: '[data-roi="item-value"]',
        salarySlider: '[data-roi="salary"]',
        salaryPeriodRadio: '[data-roi="salary-period"]',
        transactionsSlider: '[data-roi="transactions"]',
        
        // Output elements
        inventoryValueOutput: '[data-roi="inventory-value"]',
        savingsOutput: '[data-roi="savings"]',
        planOutput: '[data-roi="plan"]',
        planPriceOutput: '[data-roi="plan-price"]',
        monthlySavingsOutput: '[data-roi="monthly-savings"]'
      }
    };
    
    this.values = {
      skuCount: 1000,
      itemValue: 100,
      salary: 2000,
      salaryPeriod: 'monthly', // Toujours mensuel
      transactions: 1000
    };

    // Initialiser le calculateur
    this.init();
  }

  init() {
    // Attendre que le DOM soit complètement chargé
    window.addEventListener('load', () => {
      // Récupérer les éléments du DOM
      this.getElements();
      
      // Configurer les écouteurs d'événements
      this.setupEventListeners();
      
      // Calculer les résultats initiaux
      this.readCurrentValues();
      this.calculateResults();
    });
  }

  getElements() {
    // Récupérer les éléments de sortie
    this.outputElements = {};
    this.outputElements.inventoryValue = document.querySelectorAll(this.config.selectors.inventoryValueOutput);
    this.outputElements.savings = document.querySelectorAll(this.config.selectors.savingsOutput);
    this.outputElements.plan = document.querySelectorAll(this.config.selectors.planOutput);
    this.outputElements.planPrice = document.querySelectorAll(this.config.selectors.planPriceOutput);
    this.outputElements.monthlySavings = document.querySelectorAll(this.config.selectors.monthlySavingsOutput);
    
    // Récupérer les inputs Finsweet
    this.inputs = {};
    this.getSliderInput(this.config.selectors.skuCountSlider, 'skuCount');
    this.getSliderInput(this.config.selectors.itemValueSlider, 'itemValue');
    this.getSliderInput(this.config.selectors.salarySlider, 'salary');
    this.getSliderInput(this.config.selectors.transactionsSlider, 'transactions');
  }

  getSliderInput(selector, propertyName) {
    const container = document.querySelector(selector);
    if (container) {
      this.inputs[propertyName] = container.querySelector('input');
    }
  }

  // Supprimer cette méthode qui n'est plus nécessaire
  /*
  updateSalaryPeriod() {
    if (this.salaryPeriodRadios.length) {
      for (const radio of this.salaryPeriodRadios) {
        if (radio.checked) {
          this.values.salaryPeriod = radio.value;
          break;
        }
      }
    }
  }
  */

  setupEventListeners() {
    // Écouter les changements sur les inputs Finsweet
    for (const [property, input] of Object.entries(this.inputs)) {
      if (input) {
        input.addEventListener('input', () => {
          this.readCurrentValues();
          this.calculateResults();
        });
        
        input.addEventListener('change', () => {
          this.readCurrentValues();
          this.calculateResults();
        });
      }
    }
  }

  readCurrentValues() {
    // Lire les valeurs des inputs Finsweet
    for (const [property, input] of Object.entries(this.inputs)) {
      if (input && input.value) {
        // Si c'est une valeur logarithmique du slider, on doit la convertir
        const displayEl = input.closest('[fs-rangeslider-element="wrapper"]')
                           ?.querySelector('[fs-rangeslider-element="display-value"]');
        
        if (displayEl && displayEl.textContent) {
          this.values[property] = this.parseValue(displayEl.textContent);
        } else {
          this.values[property] = parseFloat(input.value) || 0;
        }
      }
    }
  }

  parseValue(value) {
    if (!value) return 0;
    
    // Convertir en chaîne et nettoyer (supprimer symboles de devise, etc.)
    value = value.toString().replace(/[^0-9KMk.,]/g, '');
    
    // Gérer les suffixes K et M
    if (value.includes('K') || value.includes('k')) {
      return parseFloat(value.replace(/[Kk]/g, '')) * 1000;
    } else if (value.includes('M') || value.includes('m')) {
      return parseFloat(value.replace(/[Mm]/g, '')) * 1000000;
    }
    
    // Gérer les séparateurs de milliers
    return parseFloat(value.replace(/\./g, '').replace(',', '.'));
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  }

  determineMonthlyPlan() {
    // Trouver le plan approprié basé sur le nombre de transactions
    for (const plan of this.config.plans) {
      if (this.values.transactions <= plan.transactions) {
        return plan;
      }
    }
    
    // Si nous avons plus de transactions que le plan le plus élevé, utiliser le plan le plus élevé
    return this.config.plans[this.config.plans.length - 1];
  }

  calculateResults() {
    console.log("Calculating with values:", this.values);
    
    // Calculer la valeur d'inventaire: Q1 x Q2
    const inventoryValue = this.values.skuCount * this.values.itemValue;
    
    // Le salaire est toujours mensuel
    const monthlySalary = this.values.salary;
    
    // Calculer les économies: (35% x valeur d'inventaire) + (30% x salaire mensuel)
    const savings = (0.35 * inventoryValue) + (0.3 * monthlySalary);
    
    // Déterminer le plan mensuel
    const plan = this.determineMonthlyPlan();
    
    // Calculer les économies mensuelles totales: économies - prix du plan
    const monthlySavings = savings - plan.price;
    
    // Mettre à jour tous les éléments de sortie
    this.updateOutputs({
      inventoryValue,
      savings,
      plan,
      monthlySavings
    });
  }

  updateOutputs(results) {
    console.log("Updating outputs with results:", results);
    
    // Mettre à jour la valeur d'inventaire
    this.outputElements.inventoryValue.forEach(el => {
      el.textContent = this.formatCurrency(results.inventoryValue);
    });
    
    // Mettre à jour les économies
    this.outputElements.savings.forEach(el => {
      el.textContent = this.formatCurrency(results.savings);
    });
    
    // Mettre à jour le nom du plan
    this.outputElements.plan.forEach(el => {
      el.textContent = results.plan.name;
    });
    
    // Mettre à jour le prix du plan
    this.outputElements.planPrice.forEach(el => {
      el.textContent = this.formatCurrency(results.plan.price);
    });
    
    // Mettre à jour les économies mensuelles
    this.outputElements.monthlySavings.forEach(el => {
      el.textContent = this.formatCurrency(results.monthlySavings);
    });
  }
}

// Initialiser le calculateur
new ROICalculator();
