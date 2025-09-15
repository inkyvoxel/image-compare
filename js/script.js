// Constants
const DIFFERENCE_THRESHOLD = 30;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// DOM elements
const beforeInput = document.getElementById("before");
const afterInput = document.getElementById("after");
const compareBtn = document.getElementById("compare");
const resultDiv = document.getElementById("result");
const percentageEl = document.getElementById("percentage");
const overlayCanvas = document.getElementById("overlay");

// Reusable canvas for calculations
let calculationCanvas = null;
let calculationCtx = null;

// Initialize calculation canvas
function initCalculationCanvas(width, height) {
  if (
    !calculationCanvas ||
    calculationCanvas.width !== width ||
    calculationCanvas.height !== height
  ) {
    calculationCanvas = document.createElement("canvas");
    calculationCanvas.width = width;
    calculationCanvas.height = height;
    calculationCtx = calculationCanvas.getContext("2d");
  }
  return { canvas: calculationCanvas, ctx: calculationCtx };
}

// Validate file before processing
function validateFile(file) {
  if (!file) {
    throw new Error("No file selected");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }

  if (!SUPPORTED_FORMATS.includes(file.type)) {
    throw new Error(
      `Unsupported file format. Supported formats: ${SUPPORTED_FORMATS.join(
        ", "
      )}`
    );
  }
}

window.addEventListener("load", () => {
  beforeInput.value = "";
  afterInput.value = "";
  resultDiv.style.display = "none";
});

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const beforeFile = beforeInput.files[0];
    const afterFile = afterInput.files[0];

    // Validate files
    validateFile(beforeFile);
    validateFile(afterFile);

    // Show loading state
    compareBtn.disabled = true;
    compareBtn.textContent = "Processing...";

    const [img1, img2] = await loadImages(beforeFile, afterFile);

    // Check dimensions
    if (img1.width !== img2.width || img1.height !== img2.height) {
      throw new Error(
        `Images must be the same size. Before: ${img1.width}x${img1.height}, After: ${img2.width}x${img2.height}`
      );
    }

    // Calculate difference and create overlay efficiently
    const { diffPercent, overlayImageData } = calculateDifference(img1, img2);

    // Update UI
    percentageEl.textContent = `Difference: ${diffPercent.toFixed(2)}%`;
    createOverlayFromImageData(overlayImageData, overlayCanvas);
    resultDiv.style.display = "block";
  } catch (err) {
    console.error("Image comparison error:", err);
    alert(err.message || "Error processing images. Please try again.");
  } finally {
    // Reset button state
    compareBtn.disabled = false;
    compareBtn.textContent = "Compare";
  }
});

function loadImages(file1, file2) {
  return Promise.all([loadImage(file1), loadImage(file2)]);
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Ensure image is fully loaded
        if (img.width === 0 || img.height === 0) {
          reject(new Error("Invalid image dimensions"));
          return;
        }
        resolve(img);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function calculateDifference(img1, img2) {
  const { canvas, ctx } = initCalculationCanvas(img1.width, img1.height);

  // Draw first image and get its data
  ctx.drawImage(img1, 0, 0);
  const data1 = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels1 = data1.data;

  // Draw second image and get its data
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img2, 0, 0);
  const data2 = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels2 = data2.data;

  // Create overlay data and calculate difference in one pass
  const overlayData = ctx.createImageData(canvas.width, canvas.height);
  const overlayPixels = overlayData.data;

  let diffCount = 0;
  const totalPixels = pixels1.length / 4;

  for (let i = 0; i < pixels1.length; i += 4) {
    const r1 = pixels1[i];
    const g1 = pixels1[i + 1];
    const b1 = pixels1[i + 2];
    const a1 = pixels1[i + 3];

    const r2 = pixels2[i];
    const g2 = pixels2[i + 1];
    const b2 = pixels2[i + 2];
    const a2 = pixels2[i + 3];

    // Check if pixels are significantly different
    const isDifferent =
      Math.abs(r1 - r2) > DIFFERENCE_THRESHOLD ||
      Math.abs(g1 - g2) > DIFFERENCE_THRESHOLD ||
      Math.abs(b1 - b2) > DIFFERENCE_THRESHOLD ||
      Math.abs(a1 - a2) > DIFFERENCE_THRESHOLD;

    if (isDifferent) {
      diffCount++;
      // Highlight differences in red
      overlayPixels[i] = 255; // R
      overlayPixels[i + 1] = 0; // G
      overlayPixels[i + 2] = 0; // B
      overlayPixels[i + 3] = 128; // A (semi-transparent)
    } else {
      // Keep original pixel from first image
      overlayPixels[i] = r1;
      overlayPixels[i + 1] = g1;
      overlayPixels[i + 2] = b1;
      overlayPixels[i + 3] = a1;
    }
  }

  const diffPercent = (diffCount / totalPixels) * 100;
  return { diffPercent, overlayImageData: overlayData };
}

// Create overlay from pre-calculated image data
function createOverlayFromImageData(imageData, canvas) {
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d");
  ctx.putImageData(imageData, 0, 0);
}

// Download overlay image
function downloadOverlayImage() {
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  link.download = `image-comparison-overlay-${timestamp}.png`;
  link.href = overlayCanvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Initialize download button
window.addEventListener("load", () => {
  const downloadButton = document.getElementById("download-overlay");
  if (downloadButton) {
    downloadButton.addEventListener("click", downloadOverlayImage);
  }
});
