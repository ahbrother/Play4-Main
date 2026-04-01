/*
Control-Ebene: Hier wählen wir das Land und den Zeitpunkt.

*/
let bg;
let familycolors={
10:"#FF0000",
20:"#36a636",
30:"rgb(250, 208, 20)",
40:"rgb(55, 153, 246)",
50:"rgb(243, 146, 254)",
60:"rgb(209, 199, 233)",
70:"rgb(171, 10, 157)",
80:"rgb(255, 0, 55)",
90:"rgb(255, 148, 9)",
95:"rgb(118, 91, 255)",
98:"rgb(255, 171, 223)",
999: "rgb(96, 0, 0)"
}



let countries = [];
let selectedCountry;
let selectedCountry2;
const params = {
  country: "Sweden",
  country2:"Switzerland",
  year: 1960,
  forceDivide:22.3
};
gui = new lil.GUI();

function preload() {
  loadJSON("data/EuropaCMP.json", (d) => {
    countries = Object.entries(d).map(([name, data]) => new Country(name, data));
    console.log("WTF", countries);
    jsonData = loadJSON("data/gini_bip_structured.json", ()=> console.log("BIP geladen"))
  });
}

function setup() {
//1920 * 2, 1080 * 2
3820, 2160
  createCanvas(windowWidth, windowHeight);
  //angleMode(DEGREES);
  gui
    .add(
      params,
      "country",
      countries.map((c) => c.name)
    )
    .onChange((v) => {
      selectedCountry = countries.find((c) => c.name === v);
      selectedCountry.side = "left";
      selectedCountry.setPosition(createVector(width / 4, height / 2));

      selectedCountry.setYear(params.year); // ← re-place parties at correct position
      //BIP
      updateCurrentValues();

    });

    gui.add(
      params,
      "country2", 
      countries.map((c) => c.name),)

    .onChange((v) => {
      selectedCountry2 = countries.find((c) => c.name === v);
      selectedCountry2.side = "right";
      selectedCountry2.setPosition(createVector((width / 4)*3, height / 2));

      selectedCountry2.setYear(params.year);

      updateCurrentValues();
    })


  gui.add(params, "year", 1960, 2024, 1).onChange((v) => {
    selectedCountry?.setYear(v);
    selectedCountry2?.setYear(v);
    selectedCountry?.setPosition(createVector(width / 4, height / 2));
    selectedCountry2?.setPosition(createVector((width/4)*3, height/2));

    updateCurrentValues();




// JULIA
  buildYearGiniData();

  // setup fürs GUI
  // if (countryNames.length > 0) {
  //   params.country = countryNames[0];
  //   params.country2 = countryNames.length > 1 ? countryNames[1] : countryNames[0];
  //   const availableYears = getAvailableYearsForSelection();
  //   params.year = availableYears.length > 0 ? availableYears[0] : null;
  //   updateCurrentValues();

  //   // new GUI mit lil-gui erstellen und die einstellungsoptionen für land und jahr hinzufügen
  //   gui = new lil.GUI();
  //   gui
  //     .add(params, 'country', countryNames)
  //     .onChange(() => {
  //       updateCurrentValues();
  //     });
  //   // wenn sich das land ändert, müssen auch die verfügbaren jahre aktualisiert werden (nur provisorisch, können wir noch ändern)
  //   gui
  //     .add(params, 'country2', countryNames)
  //     .onChange(() => {
  //       refreshYearController();
  //       updateCurrentValues();
  //     });

  //   yearController = gui
  //     .add(
  //       params,
  //       'year',
  //       // holt die verfügbaren jahre für das aktuell ausgewählte land, um sie als optionen für den jahr-regler zu verwenden
  //       availableYears.length > 0 ? availableYears[0] : 0,
  //       availableYears.length > 0 ? availableYears[availableYears.length - 1] : 0,
  //       1,
  //     )
  //     .onChange(() => {
  //       snapToAvailableYear(params.year);
  //       yearController.updateDisplay();
  //       updateCurrentValues();
  //     });
  // }

  });

  // set initial country and year
  selectedCountry = countries.find((c) => c.name === params.country);
  selectedCountry.side = "left";
  selectedCountry.setPosition(createVector(width / 4, height / 2));

  selectedCountry2 = countries.find((c) => c.name === params.country2);
  selectedCountry2.side = "right";
  selectedCountry2.setPosition(createVector((width / 4)*3, height / 2));

  selectedCountry.setYear(params.year);
  selectedCountry2.setYear(params.year);
const folder = gui.addFolder( 'Forces' );
folder.add(params,"forceDivide",0,50,0.1);

console.log("LINKERBIP:",currentBipLeft)
}

function draw() {
  background(10);
  stroke("#ff0000");
  //line(width/2,0,width/2,height);
  noStroke();

  drawCountryPanel(0, width / 2, params.country, currentGiniLeft, currentBipLeft);
  drawCountryPanel(width / 2, width, params.country2, currentGiniRight, currentBipRight);


  selectedCountry?.render();
  selectedCountry2?.render();

}
