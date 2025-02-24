# Logarithmic Slider for Webflow

A JavaScript plugin that adds logarithmic progression to Finsweet's range slider. Perfect for displaying exponential values like pricing ranges.

## Features

- Continuous logarithmic progression between min and max values
- Works with Finsweet's range slider structure
- Supports multiple sliders on the same page
- Customizable scale through data attributes
- Optional currency display
- Touch and mouse support
- No additional dependencies required

## Quick Install with CDN

Add this script to your project's custom code section, before the closing `</body>` tag in your Webflow project settings:

```html
<script src="https://cdn.jsdelivr.net/gh/robindelporte/ventory@v1.0.7/logarithmic-slider.js"></script>
```

## Usage

### Basic Implementation

Create your range slider in Webflow using Finsweet's Attributes Range Slider structure, then add your scale values:

```html
<div fs-rangeslider-element="wrapper" data-log-slider-scale="[0,10000]">
    <!-- Standard Finsweet range slider structure -->
</div>
```

The slider will interpolate logarithmically between 0 and 10000, allowing for continuous selection of any value in between.

### Custom Scale with Visual Markers

You can define multiple values in your scale to create visual reference points:

```html
<div fs-rangeslider-element="wrapper" data-log-slider-scale="[0,2000,4000,6000,8000,10000]">
    <!-- Standard Finsweet range slider structure -->
</div>
```

The slider will still allow continuous selection between 0 and 10000, but now you have visual markers at the specified points (2000, 4000, etc.).

### Example with Large Numbers

For large value ranges with visual markers:

```html
<div fs-rangeslider-element="wrapper" 
     data-log-slider-scale="[10,100,1000,10000,100000,1000000]">
    <!-- Standard Finsweet range slider structure -->
</div>
```

This will display: "10", "100", "1.000", "10.000", "100.000", "1M"

### Optional Currency Display

To add a currency symbol to the values:

```html
<div fs-rangeslider-element="wrapper" 
     data-log-slider-scale="[0,10000]"
     data-log-slider-currency="$">
    <!-- Standard Finsweet range slider structure -->
</div>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| data-log-slider-scale | JSON Array | [0,10000] | Defines the min, max, and marker values for the slider |
| data-log-slider-currency | String | "" | Optional currency symbol to display with values |

## Display Value

To show the current value, use Finsweet's display value element:

```html
<div fs-rangeslider-element="display-value"></div>
```

## Number Formatting

The slider automatically formats numbers for better readability:
- Thousands are separated with dots (e.g., "1.000", "10.000", "100.000")
- Millions are abbreviated with "M" (e.g., "1M" instead of "1.000.000")
- Values over a million are formatted with one decimal if needed (e.g., "1.5M")

Examples:
```
1000 → 1.000
10000 → 10.000
100000 → 100.000
1000000 → 1M
1500000 → 1.5M
```

## Requirements

- Webflow project with Finsweet's Attributes Range Slider installed
- Modern browser support (Chrome, Firefox, Safari, Edge)

## License

MIT License - feel free to use in personal and commercial projects.
