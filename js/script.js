const beforeInput = document.getElementById("before");
const afterInput = document.getElementById("after");
const compareBtn = document.getElementById("compare");
const resultDiv = document.getElementById("result");
const percentageEl = document.getElementById("percentage");
const overlayCanvas = document.getElementById("overlay");

window.addEventListener("load", () => {
  beforeInput.value = "";
  afterInput.value = "";
  resultDiv.style.display = "none";
});

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const beforeFile = beforeInput.files[0];
  const afterFile = afterInput.files[0];
  if (!beforeFile || !afterFile) {
    alert("Please select both images.");
    return;
  }
  loadImages(beforeFile, afterFile)
    .then(([img1, img2]) => {
      if (img1.width !== img2.width || img1.height !== img2.height) {
        alert("Images must be the same size.");
        return;
      }
      const diffPercent = calculateDifference(img1, img2);
      percentageEl.textContent = `Difference: ${diffPercent.toFixed(2)}%`;
      createOverlay(img1, img2, overlayCanvas);
      resultDiv.style.display = "block";
    })
    .catch((err) => {
      console.error(err);
      alert("Error loading images.");
    });
});

function loadImages(file1, file2) {
  return Promise.all([loadImage(file1), loadImage(file2)]);
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function calculateDifference(img1, img2) {
  const canvas = document.createElement("canvas");
  canvas.width = img1.width;
  canvas.height = img1.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img1, 0, 0);
  const data1 = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img2, 0, 0);
  const data2 = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let diffCount = 0;
  const total = data1.length / 4;
  const threshold = 30;
  for (let i = 0; i < data1.length; i += 4) {
    const r1 = data1[i],
      g1 = data1[i + 1],
      b1 = data1[i + 2];
    const r2 = data2[i],
      g2 = data2[i + 1],
      b2 = data2[i + 2];
    if (
      Math.abs(r1 - r2) > threshold ||
      Math.abs(g1 - g2) > threshold ||
      Math.abs(b1 - b2) > threshold
    ) {
      diffCount++;
    }
  }
  return (diffCount / total) * 100;
}

function createOverlay(img1, img2, canvas) {
  canvas.width = img1.width;
  canvas.height = img1.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img1, 0, 0);
  ctx.globalCompositeOperation = "difference";
  ctx.drawImage(img2, 0, 0);
  ctx.globalCompositeOperation = "source-over";
}
