/*
Control-Ebene: Hier wählen wir das Land und den Zeitpunkt.

*/
let bg;
let familycolors = {
  10: "#77B700",
  20: "#FF002D",
  30: "#B0001F",
  40: "#00A3E1",
  50: "#FF7E00",
  60: "#FFF359",
  70: "#FFC800",
  80: "#098C00",
  90: "#AF78D3",
  95: "#FE9FF3",
  98: "#C8C8C8",
  999: "#555555",
};

//p5graphics
let pg;

let countries = [];
let selectedCountry;
let selectedCountry2;
const params = {
  country: "Sweden",
  country2: "Switzerland",
  year: 1960,
  forceDivide: 22.3,
};
gui = new lil.GUI();

//const SERVER_URL = "http://localhost:8080"; // ← swap to your Render URL for production

const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const SERVER_URL = isLocal ? "http://localhost:8080" : window.location.origin;

function preload() {
  loadJSON("data/EuropaCMP.json", (d) => {
    countries = Object.entries(d).map(
      ([name, data]) => new Country(name, data),
    );
    dataset = loadJSON("data/gini_bip_structured.json");
  });
}

function setup() {
  //1920 * 2, 1080 * 2 : 3820, 2160
  // wir setzten es jetzt mal auf (hoffentlich) doppelte beamerauflösung in der x achse
  createCanvas(1920, 2160);
  pg = createGraphics(width, height);
  gui
    .add(
      params,
      "country",
      countries.map((c) => c.name),
    )
    .onChange(setCountry);

  gui.add(params, "year", 1960, 2024, 1).onChange(setYear);

  // set initial country and year
  selectedCountry = countries.find((c) => c.name === params.country);
  selectedCountry.side = "left";
  selectedCountry.setPosition(createVector(width / 2, height / 2));

  // selectedCountry2 = countries.find((c) => c.name === params.country2);
  // selectedCountry2.side = "right";
  // selectedCountry2.setPosition(createVector((width / 4)*3, height / 2));

  selectedCountry.setYear(params.year);
  //selectedCountry2.setYear(params.year);
  const folder = gui.addFolder("Forces");
  folder.add(params, "forceDivide", 0, 50, 0.1);

  //console.log("LINKERBIP:",currentBipLeft)

  // Socket
  connectGUI();

  // BIP
  calculateDataRanges();
  selectedCountryName = params.country;
  selectedYear = params.year;
  //createCountryGui();
  //createYearGui();
}

function draw() {
 


  pg.fill(0, 4);
  pg.noStroke();
  pg.rect(0, 0, width, height);

  selectedCountry?.render(pg);
  /******* Need to clear the background, whenever a different country is selected?! */

  background(0);
  image(pg, 0, 0, width, height);

  // noStroke();
  // fill(255);
  // rect(0,height-500, width, 500)

  selectedCountry?.renderLabels();


  /***************************  BIP*****************/

  const chartWidth = width - CHART_LINKSRECHTS_MARGIN * 2;
  const chartLeft = (width - chartWidth) / 2;
  const chartRight = chartLeft + chartWidth;
  const chartBottom = height - CHART_OBENUNTEN_MARGIN;
  const chartTop = chartBottom - 320; // ← fixe Höhe von 420px

  drawBIPCategories(chartLeft, chartRight, chartTop, chartBottom);
  drawTimeline(chartLeft, chartRight, chartTop, chartBottom);
  drawCountryPoints(chartLeft, chartRight, chartTop, chartBottom);
  drawSelectedYearLine(chartLeft, chartRight, chartTop, chartBottom);
  drawSelectedYearLabel(chartLeft, chartRight, chartTop);

  // LEGENDE
  // Country Name
  fill(255);
  textSize(20); //siehe BIP.js: function drawSelectedYearLabel
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text(params.country,10,30)

  // Partei-Infos
  fill(255);
  textStyle(NORMAL);
  selectedCountry?.legendeBeschriftung();


}

function connectGUI() {
  //  const socket = io(SERVER_URL, { transports: ["websocket"] });

  const socket = io(SERVER_URL);

  socket.on("connect", () => console.log("[GUI] connected:", socket.id));
  socket.on("disconnect", () =>
    console.warn("[GUI] disconnected — will auto-reconnect"),
  );

  socket.on("country", setCountry);
  socket.on("country2", setCountry2);
  socket.on("year", setYear);
  socket.on("forceDivide", (v) => {
    params.forceDivide = v;
  });
}

function setCountry(v) {
  // should reset the trail when we choose a different country
  pg.background(0);

  params.country = v;
  selectedCountry = countries.find((c) => c.name === v);
  selectedCountry.side = "left";
  selectedCountry.setPosition(createVector(width / 4, height / 2));
  selectedCountry.setYear(params.year);
  selectedCountryName = v;
}

function setYear(v) {
  params.year = v;
  selectedCountry?.setYear(v);
  selectedCountry2?.setYear(v);
  selectedYear = v;
  // selectedCountry?.setPosition(createVector(width / 4, height / 2));
  // selectedCountry2?.setPosition(createVector((width / 4) * 3, height / 2));
}

function setCountry2(v) {
  params.country2 = v;
  selectedCountry2 = countries.find((c) => c.name === v);
  selectedCountry2.side = "right";
  selectedCountry2.setPosition(createVector((width / 4) * 3, height / 2));
  selectedCountry2.setYear(params.year);
}
