class LogarithmicSlider {
  constructor() {
    // Attributs par défaut
    this.attributePrefix = 'data-log-slider';
    this.config = {
      wrapperAttr: 'fs-rangeslider-element="wrapper"',
      handleAttr: 'fs-rangeslider-element="handle"',
      trackAttr: 'fs-rangeslider-element="track"',
      fillAttr: 'fs-rangeslider-element="fill"',
      displayAttr: 'fs-rangeslider-element="display-value"',
      inputAttr: 'input[type="range"]'
    };
  }

  init() {
    // Initialiser tous les sliders sur la page
    document.addEventListener('DOMContentLoaded', () => {
      const sliders = document.querySelectorAll(`[${this.config.wrapperAttr}]`);
      sliders.forEach(wrapper => this.setupSlider(wrapper));
    });
  }

  getValuesFromAttribute(wrapper) {
    // Lire les valeurs depuis l'attribut data
    const scaleAttr = wrapper.getAttribute(`${this.attributePrefix}-scale`);
    if (!scaleAttr) return [1, 10, 100, 1000, 10000]; // Échelle par défaut

    try {
      return JSON.parse(scaleAttr);
    } catch (e) {
      console.error('Invalid scale format:', scaleAttr);
      return [1, 10, 100, 1000, 10000];
    }
  }

  getCurrencyFromAttribute(wrapper) {
    // Lire le symbole monétaire depuis l'attribut data
    return wrapper.getAttribute(`${this.attributePrefix}-currency`) || '€';
  }

  setupSlider(wrapper) {
    // Obtenir la configuration spécifique à ce slider
    const values = this.getValuesFromAttribute(wrapper);
    const currency = this.getCurrencyFromAttribute(wrapper);

    // Sélectionner les éléments
    const elements = {
      track: wrapper.querySelector(`[${this.config.trackAttr}]`),
      fill: wrapper.querySelector(`[${this.config.fillAttr}]`),
      handle: wrapper.querySelector(`[${this.config.handleAttr}]`),
      display: wrapper.querySelector(`[${this.config.displayAttr}]`),
      input: wrapper.querySelector(this.config.inputAttr)
    };

    // Vérifier les éléments requis
    if (!elements.track || !elements.handle) {
      console.error('Slider missing required elements');
      return;
    }

    // Configurer l'input
    if (elements.input) {
      Object.assign(elements.input, {
        min: 0,
        max: values.length - 1,
        step: 1,
        value: 0
      });
    }

    // État initial
    let isDragging = false;
    let currentValue = 0;

    // Mettre à jour l'interface
    const updateUI = (index) => {
      const percentage = (index / (values.length - 1)) * 100;
      const value = values[index];
      
      elements.handle.style.left = `${percentage}%`;
      if (elements.fill) elements.fill.style.width = `${percentage}%`;
      if (elements.display) elements.display.textContent = `${value}${currency}`;
      if (elements.input) elements.input.value = index;
      
      currentValue = index;

      // Déclencher un événement personnalisé
      wrapper.dispatchEvent(new CustomEvent('sliderChange', { 
        detail: { 
          value,
          index,
          values,
          currency 
        }
      }));
    };

    // Gestionnaires d'événements
    const handleTrackClick = (e) => {
      e.preventDefault();
      const rect = elements.track.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const index = Math.round(percentage * (values.length - 1));
      updateUI(Math.max(0, Math.min(values.length - 1, index)));
    };

    const handleDrag = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const rect = elements.track.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const percentage = x / rect.width;
      const index = Math.round(percentage * (values.length - 1));
      updateUI(Math.max(0, Math.min(values.length - 1, index)));
    };

    // Event listeners
    elements.track.addEventListener('mousedown', (e) => {
      isDragging = true;
      handleTrackClick(e);
      document.addEventListener('mousemove', handleDrag);
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.removeEventListener('mousemove', handleDrag);
      }
    });

    if (elements.input) {
      elements.input.addEventListener('input', (e) => {
        updateUI(parseInt(e.target.value));
      });
    }

    // Support tactile
    elements.track.addEventListener('touchstart', (e) => {
      isDragging = true;
      const touch = e.touches[0];
      const rect = elements.track.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const percentage = x / rect.width;
      const index = Math.round(percentage * (values.length - 1));
      updateUI(Math.max(0, Math.min(values.length - 1, index)));
    }, { passive: true });

    elements.track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const rect = elements.track.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, touch.clientX - rect.left));
      const percentage = x / rect.width;
      const index = Math.round(percentage * (values.length - 1));
      updateUI(Math.max(0, Math.min(values.length - 1, index)));
    }, { passive: true });

    elements.track.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Initialiser l'état
    updateUI(0);
  }
}

// Initialiser
const logSlider = new LogarithmicSlider();
logSlider.init();
