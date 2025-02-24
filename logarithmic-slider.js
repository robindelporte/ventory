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
        monthlySavingsOutput: '[data-roi="monthly-savings"]',
      }
    };
    
    this.values = {
      skuCount: 0,
      itemValue: 0,
      salary: 0,
      salaryPeriod: 'monthly', // 'monthly' or 'yearly'
      transactions: 0
    };

    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initializeElements();
      this.attachEventListeners();
      this.performInitialCalculation();
    });
  }

  initializeElements() {
    // Get all slider elements
    this.elements = {};
    for (const [key, selector] of Object.entries(this.config.selectors)) {
      this.elements[key] = document.querySelectorAll(selector);
    }
    
    // Initialize radio button state
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

  attachEventListeners() {
    // Fonction pour observer les changements dans le texte des éléments d'affichage
    const observeDisplayValues = () => {
      const sliders = [
        { selector: this.config.selectors.skuCountSlider, property: 'skuCount' },
        { selector: this.config.selectors.itemValueSlider, property: 'itemValue' },
        { selector: this.config.selectors.salarySlider, property: 'salary' },
        { selector: this.config.selectors.transactionsSlider, property: 'transactions' }
      ];

      sliders.forEach(slider => {
        const elements = document.querySelectorAll(slider.selector);
        elements.forEach(element => {
          const displayEl = element.querySelector('[fs-rangeslider-element="display-value"]');
          if (displayEl) {
            // Créer un MutationObserver pour chaque élément d'affichage
            const observer = new MutationObserver((mutations) => {
              mutations.forEach(mutation => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                  this.values[slider.property] = this.parseValue(displayEl.textContent);
                  this.calculateResults();
                }
              });
            });

            // Observer les changements dans le contenu textuel
            observer.observe(displayEl, {
              childList: true,
              characterData: true,
              subtree: true
            });
          }
        });
      });
    };

    observeDisplayValues();

    // Écouter également les événements sliderChange
    document.addEventListener('sliderChange', (e) => {
      const wrapper = e.target;
      
      // Identifier quel slider a changé et mettre à jour la valeur correspondante
      if (wrapper.matches(this.config.selectors.skuCountSlider)) {
        this.values.skuCount = e.detail.value;
      } else if (wrapper.matches(this.config.selectors.itemValueSlider)) {
        this.values.itemValue = e.detail.value;
      } else if (wrapper.matches(this.config.selectors.salarySlider)) {
        this.values.salary = e.detail.value;
      } else if (wrapper.matches(this.config.selectors.transactionsSlider)) {
        this.values.transactions = e.detail.value;
      }
      
      // Recalculer les résultats
      this.calculateResults();
    });

    // Écouter les changements de période de salaire
    const salaryPeriodRadios = document.querySelectorAll(this.config.selectors.salaryPeriodRadio);
    if (salaryPeriodRadios.length) {
      for (const radio of salaryPeriodRadios) {
        radio.addEventListener('change', (e) => {
          this.values.salaryPeriod = e.target.value;
          this.calculateResults();
        });
      }
    }
  }

  performInitialCalculation() {
    // Read initial values from sliders
    this.captureInitialValues();
    
    // Perform initial calculation
    this.calculateResults();
  }

  captureInitialValues() {
    // Get initial values from each slider
    const skuCountSlider = document.querySelector(this.config.selectors.skuCountSlider);
    if (skuCountSlider) {
      const displayEl = skuCountSlider.querySelector('[fs-rangeslider-element="display-value"]');
      if (displayEl) this.values.skuCount = this.parseValue(displayEl.textContent);
    }

    const itemValueSlider = document.querySelector(this.config.selectors.itemValueSlider);
    if (itemValueSlider) {
      const displayEl = itemValueSlider.querySelector('[fs-rangeslider-element="display-value"]');
      if (displayEl) this.values.itemValue = this.parseValue(displayEl.textContent);
    }

    const salarySlider = document.querySelector(this.config.selectors.salarySlider);
    if (salarySlider) {
      const displayEl = salarySlider.querySelector('[fs-rangeslider-element="display-value"]');
      if (displayEl) this.values.salary = this.parseValue(displayEl.textContent);
    }

    const transactionsSlider = document.querySelector(this.config.selectors.transactionsSlider);
    if (transactionsSlider) {
      const displayEl = transactionsSlider.querySelector('[fs-rangeslider-element="display-value"]');
      if (displayEl) this.values.transactions = this.parseValue(displayEl.textContent);
    }
  }

  parseValue(value) {
    if (!value) return 0;
    
    // Remove currency symbol and any formatting
    value = value.toString().replace(/[^0-9KMk.,]/g, '');
    
    // Handle K and M suffixes
    if (value.includes('K') || value.includes('k')) {
      return parseFloat(value.replace(/[Kk]/g, '')) * 1000;
    } else if (value.includes('M') || value.includes('m')) {
      return parseFloat(value.replace(/[Mm]/g, '')) * 1000000;
    }
    
    // Handle thousand separators
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
    // Find the appropriate plan based on transactions
    let selectedPlan = this.config.plans[0]; // Default to the lowest plan
    
    for (const plan of this.config.plans) {
      if (this.values.transactions <= plan.transactions) {
        selectedPlan = plan;
        break;
      }
    }
    
    // If we have more transactions than the highest plan, use the highest plan
    if (this.values.transactions > this.config.plans[this.config.plans.length - 1].transactions) {
      selectedPlan = this.config.plans[this.config.plans.length - 1];
    }
    
    return selectedPlan;
  }

  calculateResults() {
    // Calculate inventory value: Q1 x Q2
    const inventoryValue = this.values.skuCount * this.values.itemValue;
    
    // Calculate monthly salary if yearly
    const monthlySalary = this.values.salaryPeriod === 'yearly' 
      ? this.values.salary / 12 
      : this.values.salary;
    
    // Calculate savings: (35% x inventory value) + (30% x monthly salary)
    const savings = (0.35 * inventoryValue) + (0.3 * monthlySalary);
    
    // Determine the monthly plan
    const plan = this.determineMonthlyPlan();
    
    // Calculate total monthly savings: savings - plan price
    const monthlySavings = savings - plan.price;
    
    // Update all output elements
    this.updateOutputs({
      inventoryValue,
      savings,
      plan,
      monthlySavings
    });
  }

  updateOutputs(results) {
    // Update inventory value
    this.elements.inventoryValueOutput.forEach(el => {
      el.textContent = this.formatCurrency(results.inventoryValue);
    });
    
    // Update savings
    this.elements.savingsOutput.forEach(el => {
      el.textContent = this.formatCurrency(results.savings);
    });
    
    // Update plan name
    this.elements.planOutput.forEach(el => {
      el.textContent = results.plan.name;
    });
    
    // Update plan price
    this.elements.planPriceOutput.forEach(el => {
      el.textContent = this.formatCurrency(results.plan.price);
    });
    
    // Update monthly savings
    this.elements.monthlySavingsOutput.forEach(el => {
      el.textContent = this.formatCurrency(results.monthlySavings);
    });
  }
}

// Initialize the calculator
const roiCalculator = new ROICalculator();
