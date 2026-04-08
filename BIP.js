// let jsonData;
// let countryYearGini = {};
// let countryYearBip = {};
// let countryNames = [];
// let gui;
// let yearController;
// let currentGiniRight = 30;
// let currentBipRight = 0;
// let currentGiniLeft = 30;
// let currentBipLeft = 0;
// let maxBipEurope = 1;
// //bitmap effekt
// let bitmapDitherStrength = 22;

// const bayer4 = [
//   [0, 8, 2, 10],
//   [12, 4, 14, 6],
//   [3, 11, 1, 9],
//   [15, 7, 13, 5],
// ];



// // //lädt die json-daten und baut die datenstruktur für die gini-werte pro land und jahr auf
// // function preload() {
// //   jsonData = loadJSON(
// //     "data/gini_bip_structured.json",
// //     () => console.log('geladen'),
// //   );
// // }

// // // wenn ich die auslogge verschwindet julias viz. smh sind d visualisierige bim bip glaubs siiteverchert
// // let params = {
// //     country: "Sweden",
// //     country2:"Switzerland",
// //     year: 1960,
 
// // };

// //string hash, um wolken zu generien
// function hashString(value) {
//   //216136261 ist eine grosse primzahl, die oft in hash-funktionen verwendet wird (im internet gefunden lol)
//   //die funktion berechnet einen hash-wert für den eingegebenen string, der dann verwendet wird, um die wolkenposition und -textur zu bestimmen
//   let hash = 2166136261;
//   for (let i = 0; i < value.length; i++) {
//     hash = value.charCodeAt(i);
//     hash = Math.imul(hash, 16777619);
//   }
//   return hash >>> 0;
// }

// //generiert wolkenparameter der auf länder/jahr basiert
// function getCloudSeedForSelection(country, year) {
// //const key erstellt einen string für die kombination aus land und jahr
// //${country} und ${year} sind platzhalter, die durch die tatsächlichen werte ersetzt werden
//   const key = `${country}-${year}`;
//   const h1 = hashString(`${key}-x`);
//   const h2 = hashString(`${key}-y`);
//   const h3 = hashString(`${key}-z`);

// //mappt die hash-werte auf bereiche für die wolkenparameter
// //offset kann von -10000 bis 10000 gehen, um die wolken über die leinwand zu verschieben
//   return {
//     cloudOffsetX: map(h1, 0, 4294967295, -10000, 10000),
//     cloudOffsetY: map(h2, 0, 4294967295, -10000, 10000),
//     cloudSeedZ: map(h3, 0, 4294967295, 0, 1000),
//   };
// }

// // es wird immer das verfügbare jahr ausgewählt, das am nächsten zum eingegebenen wert liegt
// function snapToAvailableYear(value) {
//   const availableYears = getAvailableYearsForSelection();
//   //wenn kein gültiges jahr verfügbar ist, wird der parameter auf null gesetzt
//   if (availableYears.length === 0) {
//     params.year = null;
//     return;
//   }
  
// // prüft, ob der eingegebene wert eine gültige zahl ist
//   const target = Number(value);
//   if (!Number.isFinite(target)) {
//     params.year = availableYears[0];
//     return;
//   }

//   // findet das jahr, das am nächsten zum eingegebenen wert liegt
//   let closestYear = availableYears[0];
//   let minDiff = Math.abs(target - closestYear);

//   //berechnet die differenz zwischen dem eingegebenen wert und jedem verfügbaren jahr, um das nächste jahr zu finden
//   for (const year of availableYears) {
//     const diff = Math.abs(target - year);
//     if (diff < minDiff) {
//       minDiff = diff;
//       closestYear = year;
//     }
//   }

//   //aktualisiert den parameter mit dem nächsten verfügbaren jahr
//   params.year = closestYear;
// }


// //holt die gini- und bip-werte für ein bestimmtes land und jahr, mit standardwerten, falls keine daten vorhanden sind
// function getCountryValues(country, year) {
//   const countryGiniData = countryYearGini[country] || {};
//   const countryBipData = countryYearBip[country] || {};
//   console.log("BIPCOUNTRY:",country, countryBipData)
//     console.log("GINICOUNTRY:",country, countryGiniData)
//   return {
//     gini: countryGiniData[year] || 30,
//     bip: countryBipData[year] || 0,
//   };
// }

// // aktualisiert die aktuellen gini/bip-werte für beide länder
// //
// function updateCurrentValues() {
//   const leftValues = getCountryValues(params.country, params.year);
//   const rightValues = getCountryValues(params.country2, params.year);

//   currentGiniRight = rightValues.gini;
//   currentBipRight = rightValues.bip;
//   currentGiniLeft = leftValues.gini;
//   currentBipLeft = leftValues.bip;
// }

// // berechnet gini-werte pro land und jahr
// function buildYearGiniData() {
//   // prüft, ob die datenstruktur wie erwartet ist
//   if (!jsonData || !Array.isArray(jsonData.countries)) {
//     countryYearGini = {};
//     countryYearBip = {};
//     countryNames = [];
//     maxBipEurope = 1;
//     return;
//   }

//   //initialisiert die datenstrukturen für gini und bip sowie die variable für das maximale bip
//   maxBipEurope = 0;

//   // iteriert über die länder und extrahiert die gini-werte pro jahr
//   // speichert die daten in einem objekt: countryYearGini[country][year] = gini
//   for (const countryEntry of jsonData.countries) {
//     const countryName = countryEntry.country;
//     const values = Array.isArray(countryEntry.values) ? countryEntry.values : [];
//     countryYearGini[countryName] = {};
//     countryYearBip[countryName] = {};

//   // prüft auch, ob die werte gültige zahlen sind, bevor sie gespeichert werden
//     for (const row of values) {
//       const year = Number(row.Year);
//       const gini = Number(row.Gini);
//       const bip = Number(row.BIP);

//   // überspringt ungültige datenpunkte    
//       if (!Number.isFinite(year) || !Number.isFinite(gini) || !Number.isFinite(bip)) {
//         continue;
//       }

//   // speichert die gültigen gini- und bip-werte in den entsprechenden objekten
//       countryYearGini[countryName][year] = gini;
//       countryYearBip[countryName][year] = bip;

//       if (bip > maxBipEurope) {
//         maxBipEurope = bip;
//       }
//     }
//   }

//   //stellt sicher, dass maxBipEurope einen sinnvollen wert hat, um division durch null zu vermeiden
//   if (maxBipEurope <= 0) {
//     maxBipEurope = 1;
//   }

//   //sortiert die ländernamen alphabetisch in der drop-down.liste
//   countryNames = Object.keys(countryYearGini).sort((a, b) => a.localeCompare(b));
// }

// //holt die verfügbaren jahre für das aktuell ausgewählte land
// //optionen können im regler für das jahr ausgewählt werden
// function getAvailableYearsForSelection() {
//   const countryData = countryYearGini[params.country] || {};
//   return Object.keys(countryData)
//     .map(Number)
//     //sortiert die jahre aufsteigend
//     .sort((a, b) => a - b);
// }

// // aktualisiert die einstellungsoptionen des jahr-reglers basierend auf den verfügbaren jahren
// function refreshYearController() {
//   if (!yearController) {
//     return;
//   }
// // holt die verfügbaren jahre für das aktuell ausgewählte land
//   const availableYears = getAvailableYearsForSelection();
//   if (availableYears.length === 0) {
//     return;
//   }

//   //wird auf ein verfügbares jahr gesetzt, falls das aktuell ausgewählte jahr nicht verfügbar ist
//   snapToAvailableYear(params.year);

//   // aktualisiert die min/max/step werte des jahr-reglers basierend auf den verfügbaren jahren
//   yearController.min(availableYears[0]);
//   yearController.max(availableYears[availableYears.length - 1]);
//   yearController.step(1);
//   yearController.updateDisplay();
// }

// // aktualisiert den aktuellen gini-index basierend auf dem ausgewählten jahr
// function setup() {
//   createCanvas(windowWidth, windowHeight);
//   noSmooth();
//   buildYearGiniData();


//   // setup fürs GUI
//   if (countryNames.length > 0) {
//     params.country = countryNames[0];
//     params.country2 = countryNames.length > 1 ? countryNames[1] : countryNames[0];
//     const availableYears = getAvailableYearsForSelection();
//     params.year = availableYears.length > 0 ? availableYears[0] : null;
//     updateCurrentValues();

//     // new GUI mit lil-gui erstellen und die einstellungsoptionen für land und jahr hinzufügen
//     gui = new lil.GUI();
//     gui
//       .add(params, 'country', countryNames)
//       .onChange(() => {
//         updateCurrentValues();
//       });
//     // wenn sich das land ändert, müssen auch die verfügbaren jahre aktualisiert werden (nur provisorisch, können wir noch ändern)
//     gui
//       .add(params, 'country2', countryNames)
//       .onChange(() => {
//         refreshYearController();
//         updateCurrentValues();
//       });

//     yearController = gui
//       .add(
//         params,
//         'year',
//         // holt die verfügbaren jahre für das aktuell ausgewählte land, um sie als optionen für den jahr-regler zu verwenden
//         availableYears.length > 0 ? availableYears[0] : 0,
//         availableYears.length > 0 ? availableYears[availableYears.length - 1] : 0,
//         1,
//       )
//       .onChange(() => {
//         snapToAvailableYear(params.year);
//         yearController.updateDisplay();
//         updateCurrentValues();
//       });
//   }
// }

// // zeichnet die visualisierung für ein land basierend auf dem gini-index und bip
// // xStart und xEnd definieren den horizontalen bereich für das land, damit wir 2 länder nebeneinander darstellen können
// // giniValue steuert die textur der quadrate, bipValue steuert die füllhöhe der quadrate
// function drawCountryPanel(xStart, xEnd, country, giniValue, bipValue) {
//   // gini-mix von 0 bis 1
//   let giniColorMix = map(giniValue, 20, 60, 0, 1, true);
//   // quadratgrösse bezogen auf halbe canvas-breite
//   let panelWidth = xEnd - xStart;
//   let w = panelWidth / 45;
//   let rw = 30 / 100;
//   let rh = 15;
//   // skaliert die füllhöhe: unten 0, oben globales max-bip aus allen daten
//   let fillHeight = map(bipValue, 0, maxBipEurope, 0, height, true);
//   let fillTop = height - fillHeight;
//   let seed = getCloudSeedForSelection(country, params.year);

//   // clip?!
//   drawingContext.save();
//   drawingContext.beginPath();
//   drawingContext.rect(xStart, 0, xEnd -xStart, height);
//   drawingContext.clip();

//   // zeichnet die quadrate basierend auf dem gini index
//   //zeichnet von xStart bis xEnd und von fillTop bis height, damit die füllhöhe durch bip gesteuert wird
//   //je höher der gini, desto dunkler die quadrate, die textur wird gröber
//   for (let x = xStart; x < xEnd; x = x += w) {
//     for (let y = fillTop; y < height; y = y += rh) {
//       // wolkige textur: bei niedrigem gini fein, bei hohem gini gröber
//       let cloudScale = lerp(0.018, 0.005, giniColorMix);
//       let cloudNoise = noise((x + seed.cloudOffsetX) * cloudScale, (y + seed.cloudOffsetY) * cloudScale, seed.cloudSeedZ);
//       let cloudShape = pow(cloudNoise, lerp(5.8, 1.2, giniColorMix));
//       let textureAmount = lerp(0.06, 0.95, giniColorMix);
//       let grayBase = lerp(250, 8, giniColorMix);
//       // berechnet den grauwert aus basis + textur
//       // je höher der gini, desto dunkler die quadrate, da die textur stärker ins gewicht fällt
//       let gray = constrain(grayBase - cloudShape * 255 * textureAmount, 0, 255);
//       let ix = floor((x - xStart) / w);
//       let iy = floor(y / rh);
//       // bayer ist eine form von dithering
//       // iy % 4 und ix % 4 sorgt dafür, dass sich das muster alle 4 quadrate wiederholt
//       // /15 weil die bayerwerte von 0-15 reichen
//       let bayerValue = bayer4[iy % 4][ix % 4] / 15;
//       let ditherOffset = (bayerValue - 0.5) * bitmapDitherStrength;
//       let grayDithered = constrain(gray + ditherOffset, 0, 255);
//       //FARBEN für die visualisierung!!!!!!!!!
//       const whiteTone = 225;
//       const blackTone = 30;
//       // Gini steuert den Weiss/Schwarz-Anteil: niedrig fast nur Weiss, hoch deutlich mehr Schwarz
//       let whiteThreshold = lerp(160, 245, giniColorMix);
//       let grayBitmap = grayDithered > whiteThreshold ? whiteTone : blackTone;

//       // bitmap-look mit 2 farben
//       fill(grayBitmap);
//       rect(x, y, w, rh);
//     }
//   }
//   drawingContext.restore();
//     noSmooth();
// }
// // visualisierung mit gini index: je höher der gini, desto dunkler die quadrate
// function draw() {
//   background("black");

//   noStroke();
//   // Julia hat linksrechtsschwäche!!
//   // linkes land in linker hälfte
//   drawCountryPanel(0, width / 2, params.country, currentGiniLeft, currentBipLeft);
//   // rechtes land in rechter hälfte
//   drawCountryPanel(width / 2, width, params.country2, currentGiniRight, currentBipRight);

//   fill("white");
//   textSize(14);
//   textAlign(LEFT, TOP);
//   textStyle(BOLD);
//   textFont('Special Gothic');
//   // was in den parametern steht
//   // 20 und 28 sind die x und y koordinaten für die position des textes
//   text(
//     // backslash n für zeilenumbruch in p5.js
//     'COUNTRY1: ' + params.country + '\n' +
//     'JAHR: ' + params.year + '\n' +
//      'GINI1: ' + nf(currentGiniLeft, 1, 1) + '\n' +
//        'BIP1: ' + nf(currentBipLeft, 1, 0) + '\n' +
//     'COUNTRY2: ' + params.country2 + '\n' +
//     'JAHR: ' + params.year + '\n' +
   
//     'GINI2: ' + nf(currentGiniRight, 1, 1) + '\n' +
  
//     'BIP2: ' + nf(currentBipRight, 1, 0),20,28
//   );
// }

// // passt die grösse der leinwand an
// //muss man unten schreiben, damit die änderung auch klappt
// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }
