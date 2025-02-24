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
        // Input sliders
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
      salaryPeriod: 'monthly', // 'monthly' or 'yearly'
      transactions: 1000
    };

    // Initialiser le calculateur
    this.init();
  }

  init() {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Récupérer les éléments du DOM
    this.elements = {};
    for (const [key, selector] of Object.entries(this.config.selectors)) {
      this.elements[key] = document.querySelectorAll(selector);
    }

    // Récupérer l'état initial des radios pour la période du salaire
    this.updateSalaryPeriod();
    
    // Configurer les écouteurs d'événements
    this.setupEventListeners();
    
    // Calculer les résultats initiaux
    this.readCurrentSliderValues();
    this.calculateResults();
    
    // Mettre en place une vérification périodique
    setInterval(() => {
      this.readCurrentSliderValues();
      this.calculateResults();
    }, 500);
  }

  updateSalaryPeriod() {
    const salaryPeriodRadios = document.querySelectorAll(this.config.selectors.salaryPeriodRadio);
    if (salaryPeriodRadios.length) {
      for (const radio of salaryPeriodRadios) {
        if (radio.checked) {
          this.values.salaryPeriod = radio.value;
          break;
        }
      }
    }
  }

  setupEventListeners() {
    // Écouter les changements de période de salaire
    const salaryPeriodRadios = document.querySelectorAll(this.config.selectors.salaryPeriodRadio);
    if (salaryPeriodRadios.length) {
      for (const radio of salaryPeriodRadios) {
        radio.addEventListener('change', () => {
          this.updateSalaryPeriod();
          this.calculateResults();
        });
      }
    }
    
    // Fonction pour créer un écouteur pour un slider spécifique
    const createSliderListener = (sliderSelector, property) => {
      const sliders = document.querySelectorAll(sliderSelector);
      sliders.forEach(slider => {
        // Surveiller les clics sur le slider pour déclencher une lecture de valeur
        slider.addEventListener('mouseup', () => {
          this.readCurrentSliderValues();
          this.calculateResults();
        });
        
        slider.addEventListener('touchend', () => {
          this.readCurrentSliderValues();
          this.calculateResults();
        });
      });
    };
    
    // Configurer les écouteurs pour chaque slider
    createSliderListener(this.config.selectors.skuCountSlider, 'skuCount');
    createSliderListener(this.config.selectors.itemValueSlider, 'itemValue');
    createSliderListener(this.config.selectors.salarySlider, 'salary');
    createSliderListener(this.config.selectors.transactionsSlider, 'transactions');
  }

  readCurrentSliderValues() {
    // Lire les valeurs actuelles des sliders
    this.readSliderValue(this.config.selectors.skuCountSlider, 'skuCount');
    this.readSliderValue(this.config.selectors.itemValueSlider, 'itemValue');
    this.readSliderValue(this.config.selectors.salarySlider, 'salary');
    this.readSliderValue(this.config.selectors.transactionsSlider, 'transactions');
  }

  readSliderValue(selector, property) {
    const slider = document.querySelector(selector);
    if (slider) {
      const displayEl = slider.querySelector('[fs-rangeslider-element="display-value"]');
      if (displayEl && displayEl.textContent) {
        this.values[property] = this.parseValue(displayEl.textContent);
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
    let selectedPlan = this.config.plans[0]; // Par défaut, le plan le plus bas
    
    for (let i = 0; i < this.config.plans.length; i++) {
      const plan = this.config.plans[i];
      if (this.values.transactions <= plan.transactions) {
        selectedPlan = plan;
        break;
      }
    }
    
    // Si nous avons plus de transactions que le plan le plus élevé, utiliser le plan le plus élevé
    if (this.values.transactions > this.config.plans[this.config.plans.length - 1].transactions) {
      selectedPlan = this.config.plans[this.config.plans.length - 1];
    }
    
    return selectedPlan;
  }

  calculateResults() {
    // Calculer la valeur d'inventaire: Q1 x Q2
    const inventoryValue = this.values.skuCount * this.values.itemValue;
    
    // Calculer le salaire mensuel si annuel
    const monthlySalary = this.values.salaryPeriod === 'yearly' 
      ? this.values.salary / 12 
      : this.values.salary;
    
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
    // Mettre à jour la valeur d'inventaire
    this.elements.inventoryValueOutput.forEach(el => {
      el.textContent = this.formatCurrency(results.inventoryValue);
    });
    
    // Mettre à jour les économies
    this.elements.savingsOutput.forEach(el => {
      el.textContent = this.formatCurrency(results.savings);
    });
    
    // Mettre à jour le nom du plan
    this.elements.planOutput.forEach(el => {
      el.textContent = results.plan.name;
    });
    
    // Mettre à jour le prix du plan
    this.elements.planPriceOutput.forEach(el => {
      el.textContent = this.formatCurrency(results.plan.price);
    });
    
    // Mettre à jour les économies mensuelles
    this.elements.monthlySavingsOutput.forEach(el => {
      el.textContent = this.formatCurrency(results.monthlySavings);
    });
  }
}

// Initialiser le calculateur une fois le DOM chargé
window.addEventListener('load', () => {
  new ROICalculator();
});
