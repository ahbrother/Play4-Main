/*
Control-Ebene: Hier wählen wir das Land und den Zeitpunkt.

*/

let countries = [];
let selectedCountry;
const params = {
  country: "Sweden",
  year: 1944,
};
const gui = new lil.GUI();

function preload() {
  loadJSON("data/EuropaCMP.json", (d) => {
    countries = Object.entries(d).map(([name, data]) => new Country(name, data));
    console.log("WTF", countries);
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  gui
    .add(
      params,
      "country",
      countries.map((c) => c.name),
    )
    .onChange((v) => {
      selectedCountry = countries.find((c) => c.name === v);
      selectedCountry.setPosition(createVector(width / 2, height / 2));
      selectedCountry.setYear(params.year); // ← re-place parties at correct position
    });

  gui.add(params, "year", 1900, 2024, 1).onChange((v) => {
    selectedCountry?.setYear(v);
    selectedCountry?.setPosition(createVector(width / 2, height / 2));
  });

  // set initial country and year
  selectedCountry = countries.find((c) => c.name === params.country);
  selectedCountry.setPosition(createVector(width / 2, height / 2));
  selectedCountry.setYear(params.year);
}

function draw() {
  background(200);
  noStroke();
  selectedCountry?.render();
}
