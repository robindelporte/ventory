setupSliderEventListener() {
    // Écouter les événements personnalisés du slider
    document.addEventListener('sliderValueChange', (event) => {
      console.log('ROI Calculator received slider event:', event.detail);
      
      // Mettre à jour la valeur correspondante
      const { id, value } = event.detail;
      
      if (id === 'sku-count') {
        this.values.skuCount = value;
      } else if (id === 'item-value') {
        this.values.itemValue = value;
      } else if (id === 'salary') {
        this.values.salary = value;
      } else if (id === 'transactions') {
        this.values.transactions = value;
      }
      
      // Recalculer les résultats
      this.calculateResults();
    });
  }
  
  readFromGlobalValues() {
    // Si window.sliderValues existe, l'utiliser pour mettre à jour nos valeurs
    if (window.sliderValues) {
      if ('sku-count' in window.sliderValues) {
        this.values.skuCount = window.sliderValues['sku-count'];
      }
      if ('item-value' in window.sliderValues) {
        this.values.itemValue = window.sliderValues['item-value'];
      }
      if ('salary' in window.sliderValues) {
        this.values.salary = window.sliderValues['salary'];
      }
      if ('transactions' in window.sliderValues) {
        this.values.transactions = window.sliderValues['transactions'];
      }
      
      console.log('Values from global sliderValues:', this.values);
    }
  }/**
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
        // Input wrappers
        skuCountWrapper: '[data-roi="sku-count"]',
        itemValueWrapper: '[data-roi="item-value"]',
        salaryWrapper: '[data-roi="salary"]',
        transactionsWrapper: '[data-roi="transactions"]',
        
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
      transactions: 1000
    };

    // Initialiser le calculateur
    this.init();
  }

  init() {
    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    console.log("Setting up ROI Calculator");
    
    // Récupérer les éléments du DOM
    this.getElements();
    
    // Configurer les observateurs pour détecter les changements
    this.setupObservers();
    
    // Écouter les événements du slider
    this.setupSliderEventListener();
    
    // Faire le calcul initial
    this.readCurrentValues();
    this.calculateResults();
    
    // Ajouter une mise à jour périodique comme solution de secours
    setInterval(() => {
      // Récupérer les valeurs du slider depuis window.sliderValues
      this.readFromGlobalValues();
      this.calculateResults();
    }, 1000);
  }

  getElements() {
    // Obtenir les éléments d'affichage de valeur de slider
    this.displayElements = {
      skuCount: this.getDisplayElement(this.config.selectors.skuCountWrapper),
      itemValue: this.getDisplayElement(this.config.selectors.itemValueWrapper),
      salary: this.getDisplayElement(this.config.selectors.salaryWrapper),
      transactions: this.getDisplayElement(this.config.selectors.transactionsWrapper)
    };

    console.log("Display elements:", this.displayElements);
    
    // Obtenir les éléments de sortie
    this.outputElements = {
      inventoryValue: document.querySelectorAll(this.config.selectors.inventoryValueOutput),
      savings: document.querySelectorAll(this.config.selectors.savingsOutput),
      plan: document.querySelectorAll(this.config.selectors.planOutput),
      planPrice: document.querySelectorAll(this.config.selectors.planPriceOutput),
      monthlySavings: document.querySelectorAll(this.config.selectors.monthlySavingsOutput)
    };
  }

  getDisplayElement(wrapperSelector) {
    const wrapper = document.querySelector(wrapperSelector);
    if (!wrapper) return null;
    
    return wrapper.querySelector('[fs-rangeslider-element="display-value"]');
  }

  setupObservers() {
    // Configurer un MutationObserver pour chaque élément d'affichage
    for (const [property, element] of Object.entries(this.displayElements)) {
      if (element) {
        console.log(`Setting up observer for ${property}`);
        
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
              console.log(`Value changed for ${property}: ${element.textContent}`);
              this.readCurrentValues();
              this.calculateResults();
              break;
            }
          }
        });
        
        observer.observe(element, {
          characterData: true,
          childList: true,
          subtree: true
        });
      }
    }
  }

  readCurrentValues() {
    // Lire les valeurs à partir des éléments d'affichage
    for (const [property, element] of Object.entries(this.displayElements)) {
      if (element && element.textContent) {
        const rawValue = element.textContent;
        console.log(`Reading ${property}: ${rawValue}`);
        this.values[property] = this.parseValue(rawValue);
      }
    }
    console.log("Current values:", this.values);
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
    console.log("Updating outputs:", results);
    
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
window.addEventListener('load', () => {
  new ROICalculator();
});
