const $ = id => document.getElementById(id);

let uploadedImage = null;
let cameraStream = null;

let hijabColor = "#c98591";
let makeupColor = "#d98283";
let makeupType = "lip";
let makeupIntensity = 0.45;

const canvas = $("tryCanvas");
const ctx = canvas.getContext("2d");

const hijabOptions = [
  ["Dusty Rose","#c98591"],
  ["Warm Beige","#d9b99b"],
  ["Olive","#858b60"],
  ["Terracotta","#b96d55"],
  ["Lavender","#b6a1c8"],
  ["Mauve","#a87991"],
  ["Chocolate","#684a40"],
  ["Sage","#a5b39a"],
  ["Navy","#465675"],
  ["Peach","#e8a18d"],
  ["Butter Yellow","#e8cd78"],
  ["Berry","#884b68"]
];

const makeupOptions = [
  ["Peach Nude","#d98283"],
  ["Rose Pink","#c96f83"],
  ["Coral","#e77d69"],
  ["Berry","#a84967"],
  ["Mauve","#a76c83"],
  ["Terracotta","#b9654f"],
  ["Soft Brown","#98705d"],
  ["Champagne","#d6b77b"],
  ["Plum","#80516e"],
  ["Nude Beige","#c28d7d"]
];

const families = [
  ["Rose",["#f8dce3","#efb6c7","#d985a2","#b85f80","#803d5b"],"cool"],
  ["Pink",["#fce4ec","#f6b7cc","#e88eaf","#d45f91","#9e3e6b"],"cool"],
  ["Peach",["#ffe1d1","#f6b99f","#e99478","#d66e56","#a84c3d"],"warm"],
  ["Coral",["#ffd9cf","#f5a99a","#e77c70","#cc594f","#963d3b"],"warm"],
  ["Red",["#f6d5d5","#eca0a0","#d96c70","#b84350","#7e263d"],"neutral"],
  ["Berry",["#ebd7e4","#c99ab7","#a96d91","#85496f","#5d3155"],"cool"],
  ["Mauve",["#e8dce8","#c7afc8","#a88aae","#89678e","#604a69"],"cool"],
  ["Lavender",["#eee8fa","#d3c5ea","#b4a0d7","#927cbd","#68538e"],"cool"],
  ["Blue",["#dceaf5","#a9c6de","#779fbe","#4e759b","#304b70"],"cool"],
  ["Teal",["#d5eae6","#a0c9c1","#6fa99f","#477f78","#315b59"],"neutral"],
  ["Green",["#e4ebd8","#bfcda7","#94a878","#6c8557","#465e40"],"warm"],
  ["Olive",["#e8e4c8","#c9c18e","#a69d61","#7f7946","#5b5937"],"warm"],
  ["Yellow",["#fff4cf","#f8e29a","#e9c968","#cba743","#92762f"],"warm"],
  ["Gold",["#f5e6c6","#e5c78e","#cba35e","#a77d3e","#75542e"],"warm"],
  ["Orange",["#fbe1c8","#f2bb8b","#df945d","#be7040","#884b2c"],"warm"],
  ["Brown",["#e9d9ce","#c9aa96","#a9856f","#80604f","#563d35"],"warm"],
  ["Beige",["#f6ebdd","#e5d1b8","#cdb79a","#aa9276","#806b56"],"neutral"],
  ["Taupe",["#e7dfda","#c9bab1","#aa9890","#88766f","#62544f"],"neutral"],
  ["Grey",["#e9e8e8","#c6c5c7","#9b9a9d","#6f7075","#46474d"],"cool"],
  ["White",["#ffffff","#f5f0e8","#e8e0d5","#d4c8bb","#b9aa9d"],"neutral"]
];

// Membuat tepat 500 warna: 250 hijab + 250 makeup.
let allColors = [];

families.forEach(([family, shades, tone]) => {
  shades.forEach((hex, index) => {
    allColors.push({
      name: `${family} ${["Light","Soft","Medium","Deep","Dark"][index]}`,
      hex,
      tone,
      category: "hijab"
    });
  });
});

const makeupBase = [
  "#f5c7b5","#eaa48f","#d98778","#c87568","#a95d53",
  "#8e4d49","#d7a68d","#ba806f","#e3b7a0","#9f6a5f"
];

makeupBase.forEach((hex, index) => {
  allColors.push({
    name: `Makeup Tone ${index + 1}`,
    hex,
    tone: ["warm","neutral","cool"][index % 3],
    category: "makeup"
  });
});

families.forEach(([family, shades, tone]) => {
  shades.forEach((hex, index) => {
    allColors.push({
      name: `${family} Makeup ${["Sheer","Soft","Classic","Bold","Deep"][index]}`,
      hex,
      tone,
      category: "makeup"
    });
  });
});

allColors = allColors.slice(0, 500);

// Notifikasi kecil
function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");

  setTimeout(() => {
    el.classList.remove("show");
  }, 2500);
}

// Mengubah warna hex menjadi RGB
function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
}

function rgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Upload foto
$("photoInput").addEventListener("change", event => {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast("Pilih file gambar.");
    return;
  }

  if (file.size > 15 * 1024 * 1024) {
    toast("Ukuran foto maksimal 15 MB.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    loadPhoto(reader.result);
  };

  reader.readAsDataURL(file);
});

function loadPhoto(src) {
  const img = new Image();

  img.onload = () => {
    uploadedImage = img;

    $("photoPreview").src = src;
    $("photoPreview").hidden = false;
    $("emptyPhoto").hidden = true;

    $("analyzeButton").disabled = false;

    drawTryOn();

    toast("Foto berhasil dimuat ♡");
  };

  img.src = src;
}

// Analisis warna kulit sederhana
function analyzeSkin() {
  if (!uploadedImage) return;

  const temp = document.createElement("canvas");
  const tctx = temp.getContext("2d");

  temp.width = 120;
  temp.height = 120;

  tctx.drawImage(uploadedImage, 0, 0, 120, 120);

  const data = tctx.getImageData(0, 0, 120, 120).data;

  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (let y = 30; y < 100; y += 3) {
    for (let x = 25; x < 95; x += 3) {
      const i = (y * 120 + x) * 4;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (r > 50 && g > 30 && b > 20 && r >= g * 0.9 && r >= b * 0.88) {
        red += r;
        green += g;
        blue += b;
        count++;
      }
    }
  }

  if (!count) {
    toast("Foto tidak dapat dianalisis. Coba foto lain.");
    return;
  }

  red /= count;
  green /= count;
  blue /= count;

  const brightness = (red + green + blue) / 3;

  let skinTone;

  if (brightness > 190) skinTone = "Fair";
  else if (brightness > 160) skinTone = "Light";
  else if (brightness > 125) skinTone = "Medium";
  else if (brightness > 90) skinTone = "Tan";
  else skinTone = "Deep";

  let undertone;

  if (red - green > 20 && red - blue > 30) {
    undertone = "Warm";
  } else if (blue - red > 5) {
    undertone = "Cool";
  } else {
    undertone = "Neutral";
  }

  let season;

  if (undertone === "Warm") {
    season = brightness > 155 ? "Spring" : "Autumn";
  } else if (undertone === "Cool") {
    season = brightness > 155 ? "Summer" : "Winter";
  } else {
    season = brightness > 150 ? "Soft Spring" : "Soft Autumn";
  }

  $("skinTone").textContent = skinTone;
  $("undertone").textContent = undertone;
  $("season").textContent = season;

  $("emptyProfile").hidden = true;
  $("profileResult").hidden = false;

  showRecommendations(undertone);

  toast(`Profil perkiraan: ${undertone} · ${skinTone}`);
}

$("analyzeButton").addEventListener("click", analyzeSkin);

// Rekomendasi warna sesuai undertone
function showRecommendations(undertone) {
  const tone = undertone.toLowerCase();

  const hijabRecommendations = {
    warm: ["Peach", "Coral", "Olive", "Gold", "Brown", "Orange"],
    cool: ["Rose", "Pink", "Berry", "Mauve", "Lavender", "Blue"],
    neutral: ["Beige", "Taupe", "Rose", "Teal", "Brown", "Pink"]
  };

  const makeupRecommendations = {
    warm: ["Peach Nude", "Coral", "Terracotta", "Champagne"],
    cool: ["Rose Pink", "Berry", "Mauve", "Plum"],
    neutral: ["Nude Beige", "Rose Pink", "Soft Brown", "Peach Nude"]
  };

  renderRecommendations(
    "recommendedColors",
    hijabRecommendations[tone],
    "hijab"
  );

  renderRecommendations(
    "recommendedMakeup",
    makeupRecommendations[tone],
    "makeup"
  );
}

function renderRecommendations(target, names, category) {
  const container = $(target);
  container.innerHTML = "";

  names.forEach(name => {
    let item;

    if (category === "hijab") {
      item = allColors.find(c => c.name.startsWith(name) && c.category === "hijab");
    } else {
      item = makeupOptions.find(c => c[0] === name);
      if (item) item = { name: item[0], hex: item[1] };
    }

    if (!item) return;

    const el = document.createElement("button");
    el.className = "recommendation";
    el.innerHTML = `<i style="background:${item.hex}"></i>${item.name}`;

    el.addEventListener("click", () => {
      if (category === "hijab") {
        selectColor("hijab", item.name, item.hex);
      } else {
        selectColor("makeup", item.name, item.hex);
      }

      $("tryon").scrollIntoView({ behavior: "smooth" });
    });

    container.appendChild(el);
  });
}

// Membuat pilihan warna
function createColorChoices(target, options, category) {
  options.forEach(([name, color]) => {
    const button = document.createElement("button");

    button.className = "color-chip";
    button.title = name;
    button.style.background = color;

    button.addEventListener("click", () => {
      selectColor(category, name, color);
    });

    $(target).appendChild(button);
  });
}

function selectColor(category, name, color) {
  if (category === "hijab") {
    hijabColor = color;
    $("hijabPicker").value = color;
    $("hijabName").textContent = name;
    $("hijabSwatch").style.background = color;
  } else {
    makeupColor = color;
    $("makeupPicker").value = color;
    $("makeupName").textContent = name;
    $("makeupSwatch").style.background = color;
  }

  drawTryOn();
}

createColorChoices("hijabChoices", hijabOptions, "hijab");
createColorChoices("makeupChoices", makeupOptions, "makeup");

$("hijabSwatch").style.background = hijabColor;
$("makeupSwatch").style.background = makeupColor;

// Virtual try-on ilustratif
function drawTryOn() {
  if (!uploadedImage) return;

  const max = 800;
  const scale = Math.min(
    max / uploadedImage.width,
    max / uploadedImage.height,
    1
  );

  canvas.width = uploadedImage.width * scale;
  canvas.height = uploadedImage.height * scale;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(uploadedImage, 0, 0, w, h);

  const cx = w / 2;
  const cy = h * 0.48;
  const rx = w * 0.31;
  const ry = h * 0.39;

  // Overlay ilustrasi hijab
  ctx.save();

  ctx.beginPath();
  ctx.ellipse(cx, cy + ry * 0.18, rx * 1.23, ry * 1.22, 0, 0, Math.PI * 2);
  ctx.ellipse(cx, cy, rx * 0.82, ry * 0.98, 0, 0, Math.PI * 2, true);

  ctx.fillStyle = rgba(hijabColor, 0.76);
  ctx.fill("evenodd");

  ctx.restore();

  // Simulasi makeup
  if (makeupType === "lip") {
    ctx.beginPath();
    ctx.ellipse(cx, cy + ry * 0.55, rx * 0.19, ry * 0.045, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(makeupColor, makeupIntensity);
    ctx.fill();
  }

  if (makeupType === "blush") {
    [cx - rx * 0.65, cx + rx * 0.65].forEach(x => {
      ctx.beginPath();
      ctx.ellipse(x, cy + ry * 0.30, rx * 0.25, ry * 0.12, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(makeupColor, makeupIntensity * 0.55);
      ctx.fill();
    });
  }

  if (makeupType === "shadow") {
    [cx - rx * 0.42, cx + rx * 0.42].forEach(x => {
      ctx.beginPath();
      ctx.ellipse(x, cy - ry * 0.05, rx * 0.25, ry * 0.07, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(makeupColor, makeupIntensity * 0.55);
      ctx.fill();
    });
  }

  $("tryEmpty").hidden = true;
}

// Pilihan tab
document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    button.classList.add("active");

    $("hijabPanel").hidden = button.dataset.tab !== "hijab";
    $("makeupPanel").hidden = button.dataset.tab !== "makeup";
  });
});

// Jenis makeup
document.querySelectorAll(".type").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".type").forEach(b => b.classList.remove("active"));
    button.classList.add("active");

    makeupType = button.dataset.type;
    drawTryOn();
  });
});

// Custom color
$("hijabPicker").addEventListener("input", e => {
  selectColor("hijab", "Custom Color", e.target.value);
});

$("makeupPicker").addEventListener("input", e => {
  selectColor("makeup", "Custom Color", e.target.value);
});

// Intensitas makeup
$("intensity").addEventListener("input", e => {
  makeupIntensity = Number(e.target.value) / 100;
  $("intensityText").textContent = e.target.value + "%";
  drawTryOn();
});

// Reset
$("resetButton").addEventListener("click", () => {
  selectColor("hijab", "Dusty Rose", "#c98591");
  selectColor("makeup", "Peach Nude", "#d98283");

  makeupType = "lip";
  makeupIntensity = 0.45;

  $("intensity").value = 45;
  $("intensityText").textContent = "45%";

  drawTryOn();
  toast("Tampilan direset ♡");
});

// Menampilkan 500 warna
function renderPalette() {
  const search = $("searchColor").value.toLowerCase();
  const category = $("categoryFilter").value;
  const tone = $("toneFilter").value;

  const filtered = allColors.filter(color => {
    return (
      (category === "all" || color.category === category) &&
      (tone === "all" || color.tone === tone) &&
      color.name.toLowerCase().includes(search)
    );
  });

  $("colorCount").textContent = `${filtered.length} dari 500 warna`;

  const grid = $("paletteGrid");
  grid.innerHTML = "";

  filtered.forEach(color => {
    const button = document.createElement("button");
    button.className = "palette-item";

    button.innerHTML = `
      <span class="palette-swatch" style="background:${color.hex}"></span>
      <b>${color.name}</b>
      <small>${color.category} · ${color.tone}</small>
    `;

    button.addEventListener("click", () => {
      selectColor(color.category, color.name, color.hex);

      document.querySelector(
        color.category === "hijab"
          ? '[data-tab="hijab"]'
          : '[data-tab="makeup"]'
      ).click();

      $("tryon").scrollIntoView({ behavior: "smooth" });
    });

    grid.appendChild(button);
  });
}

["searchColor", "categoryFilter", "toneFilter"].forEach(id => {
  $(id).addEventListener("input", renderPalette);
  $(id).addEventListener("change", renderPalette);
});

renderPalette();

// Kamera
async function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }

  $("cameraVideo").srcObject = null;
}

async function openCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    toast("Kamera memerlukan localhost atau HTTPS.");
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    $("cameraVideo").srcObject = cameraStream;
    $("cameraModal").classList.add("open");
    $("cameraError").textContent = "";

  } catch (error) {
    $("cameraModal").classList.add("open");

    if (error.name === "NotAllowedError") {
      $("cameraError").textContent = "Izin kamera ditolak. Izinkan kamera di pengaturan browser.";
    } else if (error.name === "NotFoundError") {
      $("cameraError").textContent = "Kamera tidak ditemukan.";
    } else {
      $("cameraError").textContent = "Kamera tidak dapat dibuka: " + error.message;
    }
  }
}

$("cameraButton").addEventListener("click", openCamera);

async function closeCamera() {
  $("cameraModal").classList.remove("open");
  await stopCamera();
}

$("closeCamera").addEventListener("click", closeCamera);
$("cancelCamera").addEventListener("click", closeCamera);

$("capturePhoto").addEventListener("click", () => {
  const video = $("cameraVideo");

  if (!video.videoWidth) {
    toast("Kamera belum siap.");
    return;
  }

  const temp = document.createElement("canvas");
  temp.width = video.videoWidth;
  temp.height = video.videoHeight;

  temp.getContext("2d").drawImage(video, 0, 0);

  loadPhoto(temp.toDataURL("image/jpeg", 0.92));

  closeCamera();
});