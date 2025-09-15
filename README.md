# Image Compare

A simple web app to compare two images, calculate the percentage of differing pixels, and display a difference overlay.

## Features

- Upload two images (must be the same size)
- Calculates the percentage of pixels that differ significantly (threshold: 30 in any RGB channel)
- Displays a difference overlay using canvas composite operations

## Usage

1. Open `index.html` in your web browser.
2. Select the "Before" and "After" images.
3. Click "Compare" to see the results.

The app works entirely locally in the browser. No data is sent to any server.

## Technologies

- Vanilla JavaScript
- HTML5 Canvas for image processing
- PicoCSS for styling

## License

[MIT](LICENCE)
