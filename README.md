# Image Compare Tool 🔍

A simple web app to compare two images, calculate the percentage of differing pixels, and display a difference overlay. Perfect for quality control, design reviews, and visual regression testing.

View a demo [here](https://inkyvoxel.github.io/image-compare/).

## Features

- Upload two images (must be the same size)
- File validation (10MB max, supports JPEG, PNG, GIF, WebP)
- Calculates the percentage of pixels that differ significantly (threshold: 30 in any RGB channel)
- Displays a difference overlay with differences highlighted in red
- Download the overlay image

## Usage

1. Open `index.html` in your web browser.
2. Select the "Before" and "After" images.
3. Click "Compare" to see the results.
4. Optionally download the overlay image.

The app works entirely locally in the browser. No data is sent to any server.

## Technologies

- Vanilla JavaScript
- HTML5 Canvas for image processing
- PicoCSS for styling

## License

[MIT](LICENSE)
