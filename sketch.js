/*
Control-Ebene: Hier wählen wir das Land und den Zeitpunkt.

*/
let familycolors={
10:"#FF0000",
20:"#00FF00",
30:"rgb(255, 255, 0)",
40:"rgb(0, 255, 217)",
50:"rgb(0, 137, 62)",
60:"rgb(76, 0, 255)",
70:"rgb(255, 0, 234)",
80:"rgb(255, 0, 55)",
90:"rgb(255, 225, 0)",
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
const gui = new lil.GUI();

function preload() {
  loadJSON("data/EuropaCMP.json", (d) => {
    countries = Object.entries(d).map(([name, data]) => new Country(name, data));
    console.log("WTF", countries);
  });
}

function setup() {

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
    })


  gui.add(params, "year", 1960, 2024, 1).onChange((v) => {
    selectedCountry?.setYear(v);
    selectedCountry2?.setYear(v);
    selectedCountry?.setPosition(createVector(width / 4, height / 2));
    selectedCountry2?.setPosition(createVector((width/4)*3, height/2));
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

}

function draw() {
  background(20);
  stroke("#ff0000");
  line(width/2,0,width/2,height);
  noStroke();


  selectedCountry?.render();
  selectedCountry2?.render();

}
