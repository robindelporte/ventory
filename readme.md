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

### Quick Install with CDN (Recommended)

Add this script to your project's custom code section, before the closing `</body>` tag in your Webflow project settings:

```html
<script src="https://cdn.jsdelivr.net/gh/robindelporte/ventory@v1.0.0/logarithmic-slider.js"></script>
```

### Manual Installation

1. Create your range slider in Webflow using Finsweet's Attributes Range Slider
2. Add the `logarithmic-slider.js` script to your project's custom code section
3. Make sure to add it before the closing `</body>` tag

## Usage

### Basic Implementation

The slider will work with the default scale (1, 10, 100, 1000, 10000) if no custom scale is provided. Values will be displayed without currency unless specified:

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

### Optional Currency

To add a currency symbol to the displayed values, use the `data-log-slider-currency` attribute:

```html
<div fs-rangeslider-element="wrapper" 
     data-log-slider-currency="$">
    <!-- Standard Finsweet range slider structure -->
</div>
```

If no currency attribute is provided, only the numeric value will be displayed.

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
| data-log-slider-currency | String | "" | Optional currency symbol to display with values |

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
