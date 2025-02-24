
# Logarithmic Slider for Webflow

A JavaScript plugin that transforms Finsweet's range slider into a logarithmic slider. Perfect for displaying exponential values like pricing ranges.

## Features

- Works with Finsweet's range slider structure
- Supports multiple sliders on the same page
- Customizable scale through data attributes
- Customizable currency symbol
- Touch and mouse support
- No additional dependencies required

## Installation

1. Create your range slider in Webflow using Finsweet's Attributes Range Slider
2. Add the `logarithmic-slider.js` script to your project's custom code section

```javascript
// Add this code at the end of your body tag
<script src="path-to/logarithmic-slider.js"></script>
```

## Usage

### Basic Implementation

The slider will work with the default scale (1, 10, 100, 1000, 10000) if no custom scale is provided:

```html
<div fs-rangeslider-element="wrapper">
    <!-- Standard Finsweet range slider structure -->
</div>
```

### Custom Scale

To use a custom scale, add the `data-log-slider-scale` attribute with a JSON array of values:

```html
<div fs-rangeslider-element="wrapper" 
     data-log-slider-scale="[1,5,25,125,625]">
    <!-- Standard Finsweet range slider structure -->
</div>
```

### Custom Currency

To change the currency symbol, use the `data-log-slider-currency` attribute:

```html
<div fs-rangeslider-element="wrapper" 
     data-log-slider-currency="$">
    <!-- Standard Finsweet range slider structure -->
</div>
```

### Combined Example

You can combine both custom scale and currency:

```html
<div fs-rangeslider-element="wrapper" 
     data-log-slider-scale="[1,5,25,125,625]"
     data-log-slider-currency="$">
    <!-- Standard Finsweet range slider structure -->
</div>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| data-log-slider-scale | JSON Array | [1,10,100,1000,10000] | Defines the values for the slider steps |
| data-log-slider-currency | String | "€" | Currency symbol to display with values |

## Events

The slider triggers a custom event 'sliderChange' when the value changes. You can listen to this event to perform custom actions:

```javascript
const slider = document.querySelector('[fs-rangeslider-element="wrapper"]');
slider.addEventListener('sliderChange', (e) => {
    const { value, index, values, currency } = e.detail;
    console.log('Current value:', value);
});
```

## Requirements

- Webflow project with Finsweet's Attributes Range Slider installed
- Modern browser support (Chrome, Firefox, Safari, Edge)

## License

MIT License - feel free to use in personal and commercial projects.

## Credits

Built on top of Finsweet's Range Slider structure.
