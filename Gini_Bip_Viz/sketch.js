let goodbye;
let jsonData;
let countryYearGini = {};
let countryNames = [];
let gui;
let yearController;
let currentGini = 30;

let params = {
  country: '',
  year: null,
};

function preload() {
  jsonData = loadJSON(
    'data/gini_bip_structured.json',
    () => console.log('geladen'),
  );
}

function updateCurrentGini() {
  const countryData = countryYearGini[params.country] || {};
  currentGini = countryData[params.year] || 30;
}

// berechnet gini-werte pro land und jahr
function buildYearGiniData() {
  if (!jsonData || !Array.isArray(jsonData.countries)) {
    countryYearGini = {};
    countryNames = [];
    return;
  }

  for (const countryEntry of jsonData.countries) {
    const countryName = countryEntry.country;
    const values = Array.isArray(countryEntry.values) ? countryEntry.values : [];
    countryYearGini[countryName] = {};

    for (const row of values) {
      const year = Number(row.Year);
      const gini = Number(row.Gini);

      if (!Number.isFinite(year) || !Number.isFinite(gini)) {
        continue;
      }
      countryYearGini[countryName][year] = gini;
    }
  }

  countryNames = Object.keys(countryYearGini).sort((a, b) => a.localeCompare(b));
}

function getAvailableYearsForSelection() {
  const countryData = countryYearGini[params.country] || {};
  return Object.keys(countryData)
    .map(Number)
    .sort((a, b) => a - b);
}

function refreshYearController() {
  if (!yearController) {
    return;
  }

  const availableYears = getAvailableYearsForSelection();
  if (availableYears.length === 0) {
    return;
  }

  if (!availableYears.includes(Number(params.year))) {
    params.year = availableYears[0];
  }

  yearController.options(availableYears);
  yearController.updateDisplay();
}

// aktualisiert den aktuellen gini-index basierend auf dem ausgewählten jahr
function setup() {
  createCanvas(windowWidth, windowHeight);
  buildYearGiniData();


  // setup fürs GUI
  if (countryNames.length > 0) {
    params.country = countryNames[0];
    const availableYears = getAvailableYearsForSelection();
    params.year = availableYears.length > 0 ? availableYears[0] : null;
    updateCurrentGini();

    gui = new lil.GUI();
    gui
      .add(params, 'country', countryNames)
      .name('Land')
      .onChange(() => {
        refreshYearController();
        updateCurrentGini();
      });

    yearController = gui
      .add(params, 'year', getAvailableYearsForSelection())
      .name('Jahr')
      .onChange(updateCurrentGini);
  }
}

function draw() {
  background(220);
  // mappt den gini index auf einer variable (hier in quadraten)
  let giniFactor = map(currentGini, 20, 60, 0.6, 1.8, true);
  let w = width / 100;
  let t = frameCount * 0.01;

  noStroke();
  //zeichnet die quardate basierend auf dem gini index, je höher der gini index desto dunler die quardate
  for (let x = 0; x < width; x = x + w) {
    for (let y = 0; y < height; y = y + w) {
      //noise wert wird mit gini faktor multipliziert, damit die quadrate bei höherem gini index dunkler werden
      let fillValue = noise(x * 0.01, y * 0.01, t) * 255 * giniFactor;
      fillValue = constrain(fillValue, 0, 255);
      fill(fillValue);
      rect(x, y, w, w);
    }
  }

  fill(0);
  textSize(14);
  text(
    //was in den parametern steht
    'Land: ' + params.country + ' | Jahr: ' + params.year + ' | Gini: ' + nf(currentGini, 1, 1),
    20,
    28,
  );
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
