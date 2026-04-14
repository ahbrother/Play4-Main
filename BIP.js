let dataset;
let minYear = 1960;
let maxYear = 2024;
let dataYears = [];
let windowWidth = 1200;
let minBIP = 0;
let maxBIP = 0;
let countrySelect;
let selectedCountryName = "";
let countryLookup = new Map();
let yearSlider;
let selectedYear = 1960;


//eine art css für die abstände im zeitstrahl
const CATEGORY_COUNT = 4;
const BIP_AXIS_MIN = 0;
const BIP_AXIS_MAX = 150000;
const CHART_OBENUNTEN_MARGIN = 25;
const CHART_LINKSRECHTS_MARGIN = 120;
//vier länder davor hell anzeigen, danach dunkel ausfaden
const FOCUS_WINDOW_BEFORE = 5;
//kein land danach hell anzeigen
const FOCUS_WINDOW_AFTER = 0;
const FOCUS_FADE_MAX_ALPHA = 255;



//berechnet die min/max jahre und bip-werte aus dem datensatz
function calculateDataRanges() {
  if (!dataset || !Array.isArray(dataset.countries)) {
    return;
  }

  //lokale variablen, um die min/max werte zu berechnen
  //Infinity und -Infinity als startwerte
  //damit jede gültige zahl diese überschreibt
  let localYearMin = Infinity;
  let localYearMax = -Infinity;
  let localBIPMin = Infinity;
  let localBIPMax = -Infinity;
  const yearsSet = new Set();

  //durchlaufen alle länder im datensatz
  for (const country of dataset.countries) {
    if (!country.values || !Array.isArray(country.values)) {
      continue;
    }

    //durchlaufen alle datenpunkte eines landes
    //prüfen die jahreszahlen und bip-werte auf gültigkeit
    for (const entry of country.values) {
      const year = Number(entry.Year);
      const bip = Number(entry.BIP);

      //jahreszahlen können auch null oder keine zahl sein
      //nur gültige jahreszahlen berücksichtigen
      if (Number.isFinite(year)) {
        localYearMin = min(localYearMin, year);
        localYearMax = max(localYearMax, year);
        yearsSet.add(floor(year));
      }

      //bip-werte können auch null oder keine zahl sein
      //nur gültige bip-werte berücksichtigen
      if (Number.isFinite(bip)) {
        localBIPMin = min(localBIPMin, bip);
        localBIPMax = max(localBIPMax, bip);
      }
    }
  }

  //wenn güötige jahreszahlen gefunden werden, dann werden sie als min/max jahre gesetzt
  if (Number.isFinite(localYearMin) && Number.isFinite(localYearMax)) {
    minYear = floor(localYearMin);
    maxYear = ceil(localYearMax);
  }

  //wenn gültige bip-werte gefunden werden, dann werden sie als min/max bip gesetzt
  if (Number.isFinite(localBIPMin) && Number.isFinite(localBIPMax)) {
    minBIP = localBIPMin;
    maxBIP = localBIPMax;
  }

  dataYears = Array.from(yearsSet).sort((a, b) => a - b);
  selectedYear = minYear;
 //erstellt eine sortiere liste der länder
  const sortedCountries = [...dataset.countries]
    .filter((country) => typeof country.country === "string")
    //sortiert nach ländernamen (alphabetisch)
    .sort((a, b) => a.country.localeCompare(b.country));

    //erstellt eine map
  countryLookup = new Map();
  for (const country of sortedCountries) {
    countryLookup.set(country.country, country);
  }

  if (sortedCountries.length > 0) {
    selectedCountryName = sortedCountries[0].country;
  }
}

function createCountryGui() {
  countrySelect = createSelect();
  countrySelect.position(20, 20);
  countrySelect.style("width", "280px");

  for (const countryName of countryLookup.keys()) {
    countrySelect.option(countryName);
  }

  if (selectedCountryName) {
    countrySelect.value(selectedCountryName);
  }

  countrySelect.changed(() => {
    selectedCountryName = countrySelect.value();
    redraw();
  });
}

function createYearGui() {
  yearSlider = createSlider(minYear, maxYear, selectedYear, 1);
  yearSlider.position(20, 52);
  yearSlider.style("width", "280px");
  yearSlider.input(() => {
    selectedYear = Number(yearSlider.value());
    redraw();
  });
}

function drawBIPCategories(xStart, xEnd, yTop, yBottom) {
  stroke(255);
  strokeWeight(1);
  line(xStart, yTop, xStart, yBottom);

  for (let i = 0; i < CATEGORY_COUNT; i++) {
    const t = i / (CATEGORY_COUNT - 1);
    const y = lerp(yBottom, yTop, t);
    const categoryValue = lerp(BIP_AXIS_MIN, BIP_AXIS_MAX, t);

    stroke(255);
    strokeWeight(1);
    line(xStart, y, xEnd, y);

    line(xStart, y, xStart + 7, y);

    noStroke();
    fill(255);
    textAlign(RIGHT, CENTER);
    textSize(20);
    text(formatBIPValue(categoryValue), xStart - 12, y);
    //console.log("xStart:", xStart) //120
  }

  noStroke();
  fill(30);
  textAlign(CENTER, CENTER);
  textSize(20);
}

//zeichnet die vertikalen linien für die jahreszahlen
function drawTimeline(xStart, xEnd, yTop, yBottom) {
  stroke(255);
  strokeWeight(0.5);
  line(xStart, yBottom, xEnd, yBottom);

  if (dataYears.length === 0) {
    return;
  }

  //verteilt die jahreszahlen gleichmässig über die breite des diagramms
  for (let i = 0; i < dataYears.length; i++) {
    const x = dataYears.length === 1
      ? (xStart + xEnd) / 2
      : map(i, 0, dataYears.length - 1, xStart, xEnd);

    stroke(255);
    strokeWeight(1);
    line(x, yTop, x, yBottom);

    line(x, yBottom - 9, x, yBottom);
  }
}

//zeichnet die datenpunkte eines landes als linie und sehr kleine punkte
function drawCountryPoints(xStart, xEnd, yTop, yBottom) {
  if (!selectedCountryName || !countryLookup.has(selectedCountryName)) {
    return;
  }

  //holt die daten für das ausgewählte land
  const country = countryLookup.get(selectedCountryName);
  if (!country || !Array.isArray(country.values)) {
    return;
  }
  //filtert ungültige datenpunkte heraus und sortiert sie nach jahr
  //CLAUDE
//   const validValues = country.values
//   .map((entry) => ({
//     year: Number(entry.Year),
//     bip: Number(entry.BIP),
//   }))
//   .filter((entry) => Number.isFinite(entry.year) && Number.isFinite(entry.bip) && entry.year <= selectedYear) // ← nur bis selectedYear
//   .sort((a, b) => a.year - b.year);


  const validValues = country.values
    .map((entry) => ({
      year: Number(entry.Year),
      bip: Number(entry.BIP),
    }))
    .filter((entry) => Number.isFinite(entry.year) && Number.isFinite(entry.bip))
    .sort((a, b) => a.year - b.year);

  if (validValues.length === 0) {
    return;
  }

  const windowStartYear = selectedYear - FOCUS_WINDOW_BEFORE;
  const windowEndYear = selectedYear + FOCUS_WINDOW_AFTER ;

  //zeichnet die linien zwischen den datenpunkten
  //die linien sind etwas dicker und weiss, damit sie sich von den punkten abheben
  stroke(255);
  strokeWeight(1.5);
  //linien waren rund, so sind die eckiger wie im figma entwurf
  strokeJoin(MITER);
  strokeCap(SQUARE);
  for (let i = 0; i < validValues.length - 1; i++) {
  const current = validValues[i];
  const next = validValues[i + 1];

  // nichts zeichnen, wenn wir über das selectedYear hinausgehen
  if (current.year > selectedYear) break;

  // Linie abschneiden, wenn sie über das selectedYear hinausgeht
  if (next.year > selectedYear) {
    const t = (selectedYear - current.year) / (next.year - current.year);

    const currentX = map(current.year, minYear, maxYear, xStart, xEnd, true);
    const currentY = map(current.bip, BIP_AXIS_MIN, BIP_AXIS_MAX, yBottom, yTop, true);

    const nextX = map(next.year, minYear, maxYear, xStart, xEnd, true);
    const nextY = map(next.bip, BIP_AXIS_MIN, BIP_AXIS_MAX, yBottom, yTop, true);

    // 👉 interpolierter Punkt genau beim selectedYear
    const cutX = lerp(currentX, nextX, t);
    const cutY = lerp(currentY, nextY, t);

    stroke(255);
    strokeWeight(6);
    line(currentX, currentY, cutX, cutY);

    break; // danach nix mehr zeichnen
  }

  // normaler Fall (komplett innerhalb der Vergangenheit)
  const currentX = map(current.year, minYear, maxYear, xStart, xEnd, true);
  const currentY = map(current.bip, BIP_AXIS_MIN, BIP_AXIS_MAX, yBottom, yTop, true);
  const nextX = map(next.year, minYear, maxYear, xStart, xEnd, true);
  const nextY = map(next.bip, BIP_AXIS_MIN, BIP_AXIS_MAX, yBottom, yTop, true);

  stroke(255);
  strokeWeight(6);
  line(currentX, currentY, nextX, nextY);
}
//   for (let i = 0; i < validValues.length - 1; i++) {
//     const current = validValues[i];
//     const next = validValues[i + 1];
//     const currentX = map(current.year, minYear, maxYear, xStart, xEnd, true);
//     const currentY = map(current.bip, BIP_AXIS_MIN, BIP_AXIS_MAX, yBottom, yTop, true);
//     const nextX = map(next.year, minYear, maxYear, xStart, xEnd, true);
//     const nextY = map(next.bip, BIP_AXIS_MIN, BIP_AXIS_MAX, yBottom, yTop, true);
//     const midYear = (current.year + next.year) * 0.5;
//     const alpha = getLineChartAlpha(midYear, windowStartYear, windowEndYear);

//     strokeWeight(6);
//     stroke(255, alpha);
//     line(currentX, currentY, nextX, nextY);
//   }

  noStroke();
  fill(255);

  //zeichnet die datenpunkte als kleine kreise
  for (const entry of validValues) {
    const x = map(entry.year, minYear, maxYear, xStart, xEnd, true);
    const y = map(entry.bip, BIP_AXIS_MIN, BIP_AXIS_MAX, yBottom, yTop, true);
    const alpha = getLineChartAlpha(entry.year, windowStartYear, windowEndYear);
    //kreise sind weiss, wie die linie
    fill(255, alpha);
    circle(x, y, 1);
  }
}

function getLineChartAlpha(year, windowStartYear, windowEndYear) {
  if (year >= windowStartYear && year <= windowEndYear) {
    return 255;
  }

  let distanceYears = 0;
  if (year < windowStartYear) {
    distanceYears = windowStartYear - year;
  } else {
    distanceYears = year - windowEndYear;
  }

  const t = constrain(distanceYears / max(1, FOCUS_WINDOW_BEFORE), 0, 1);
  return lerp(255, 0, t);
}

//fade effekt von copilot empfohlen so zu schreiben
function drawFocusFadeOverlay(xStart, xEnd, yTop, yBottom) {
  noStroke();

  //berechnet die jahreszahlen, die innerhalb und ausserhalb des fokusfensters liegen
  const windowStartYear = selectedYear - FOCUS_WINDOW_BEFORE;
  const windowEndYear = selectedYear + FOCUS_WINDOW_AFTER;

  //durchläuft alle pixel entlang der x-achse und berechnet die transparenz
  //je weiter ein pixel von den grenzen des fokusfensters entfernt ist, desto dunkler wird er
  for (let x = floor(xStart); x <= ceil(xEnd); x++) {
    //hier wird die jahreszahl berechnet, die diesem pixel entspricht
    const yearAtX = map(x, xStart, xEnd, minYear, maxYear, true);
    let distanceYears = 0;

    //wenn die jahreszahl links vom fokusfenster lieg, wird die entfernung zum start berechnet
    //ansonsten wird entfernung zum ende berechnet (rechts)
    if (yearAtX < windowStartYear) {
      distanceYears = windowStartYear - yearAtX;
    } else if (yearAtX > windowEndYear) {
      distanceYears = yearAtX - windowEndYear;
    }
    //hier wird die entfernung in jahreszahlen in einen wert zwischen 0 und 1 umgerechnet, der dann für die transparenz verwendet wird
    //je weiter die jahreszahl von den grenzen des fokusfensters entfernt ist, desto näher ist t an 1, und desto höher ist die transparenz
    const t = constrain(distanceYears / FOCUS_WINDOW_BEFORE, 0, 1);
    const alpha = lerp(0, FOCUS_FADE_MAX_ALPHA, t);
    fill(0, alpha);
    rect(x, yTop, 1, yBottom - yTop);
  }
}
//zeichnet die vertikale linie für das ausgewählte jahr
function drawSelectedYearLine(xStart, xEnd, yTop, yBottom) {
  const x = map(selectedYear, minYear, maxYear, xStart, xEnd, true);
  //rote linie, damit sie sich von den anderen linien abhebt
  stroke(255);
  strokeWeight(5);
  line(x, yTop, x, yBottom);
}

function drawSelectedYearLabel(xStart, xEnd, yTop) {
  const x = map(selectedYear, minYear, maxYear, xStart, xEnd, true);

  noStroke();
  //rote beschriftung für jahreszahl
  fill(255);
  textAlign(CENTER, BOTTOM);
  textStyle(BOLD);
  textSize(30);
  text(selectedYear, x, yTop - 8);
}

//formatiert die bipwerte
function formatBIPValue(value) {
  const roundedToThousand = round(value / 1000) * 1000;
  return nfc(roundedToThousand, 0);
}

function getFadeAlpha(year) {
  const distance = selectedYear - year;

  // Zukunft komplett ausblenden
  if (distance < 0) return 0;

  const t = constrain(distance / FOCUS_WINDOW_BEFORE, 0, 1);
  return lerp(255, 0, t);
}

//wenn das fenster grösser oder kleiner wird, wird die grösse der canvas angepasst
// function windowResized() {
//   resizeCanvas(windowWidth*2, 420);
//   if (countrySelect) {
//     countrySelect.position(20, 20);
//   }
//   if (yearSlider) {
//     yearSlider.position(30, 52);
//   }
//   redraw();
// }

