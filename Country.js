class Country {
  constructor(name, data, x, y) {
    this.name = name;
    this.data = data;
    this.pos = createVector(x, y);
    // console.log("data", data);
    this.elections = Object.entries(data).map(([year, d]) => ({
      year: Number(year),
      parties: d.parties,
    }));
    this.election = this.elections[0];
    this.currentParties = []; // current parties at the moment
  }

  setPosition(position) {
    this.pos.set(position);
  }

  setYear(year) {
    // Find closest year
    this.election = this.elections.reduce((prev, curr) =>
      Math.abs(curr.year - year) < Math.abs(prev.year - year) ? curr : prev,
    );
    // console.log("ELection:", this.election);
    this.selectedYear = year;
    this._setElection(this.election.parties);
    // console.log("einzelne Parteien:", this.election.parties);
  }

  // change year triggers _setElection
  _setElection(ps) {
    // remove parties that no longer exist
    // console.log("ps", ps, this.currentParties);
    this.currentParties = this.currentParties.filter((p) =>
      ps.some((pd) => pd.partyname === p.data.partyname && pd.absseat > 0),
    );
    console.log("currentParties", this.currentParties);


    // update existing, add new
    ps.forEach((pd, i) => {
      console.log(pd.absseat);

      if (pd.absseat != null && pd.absseat != 0) {
        const x = map(pd.rile, -100, 100, 0, width);
        const y = map(pd.absseat, 0, (pd.totseats / 6) * 5, height - 450, 0);
        constrain(y, 0, height - 450); //not quite sure if that works lol

        const existing = this.currentParties.find(
          (p) => p.data.partyname === pd.partyname && pd.absseat > 0,
        );
        if (existing) {
          existing.data = pd;
          existing.side = this.side;
          existing.moveTo(x, y);
          existing.updateSeats(pd.absseat); //neu?!
        } else {
          // console.log("neue Partei bei:", x, y);
          let p = new Party(pd, x, y, color);
          p.side = this.side;
          this.currentParties.push(p);
          // console.log("Aktuelle Parteien:", this.currentParties);
        }
      }
    });
  }

  legendeBeschriftung() {
    if (!this.currentParties || !this.currentParties.length) return;
    //console.log("AKtuelle Parteien:", this.election.parties[0].partyname)
    let x = 50;
    let y = 70;
    for (let i = 0; i < this.currentParties.length; i++) {
      let name = this.currentParties[i].data.partyname ?? "NaN";
      // let abkr = this.currentParties[i].data.partyabbrev ?? "NaN";
      let seats = this.currentParties[i].data.absseat ?? "0";
      // console.log("currentParties:", this.currentParties);
      //console.log("erstes Element:", this.currentParties[0]);

      let step = 2;
      if (i % step == 0) {
        x = 90;
      } else {
        x = width / 2 + 60;
      }

      fill(255);
      textAlign(LEFT, CENTER);
      textSize(20);
      //text(abkr, x,y)
      text(truncateToWidth(name,790),x, y);

      textAlign(RIGHT, CENTER);
      text(seats, x + 810, y);

      //TRENNLINIE
      stroke(255);
      strokeWeight(1.5);
      line(x, y + 15, x + 810, y + 15); // chli meh platz
      noStroke();

      // nur jede zweite iteration == gleichmässiges layout
      if (i % step == step - 1) {
        y += 35;
      }
      //console.log("PARTEISITZE",this.election.parties[i].absseat)
    }
  }

  updateCountryParties() {
    // hier wollen wir die Positionen der Sitze Vergleichen und sichergehen, dass sich die einzelnen Parteien nicht überlappen
    for (let i = 0; i < this.currentParties.length; i++) {
      for (let j = i + 1; j < this.currentParties.length; j++) {
        let seatsA = this.currentParties[i].getSeats(); // Sitze Partei i
        let seatsB = this.currentParties[j].getSeats(); // Sitze Partei j

        for (let a of seatsA) {
          for (let b of seatsB) {
            let d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
            let minDist = 30;
            if (d < minDist && d > 0) {
              let overlap = minDist - d;
              let dir = p5.Vector.sub(a.pos, b.pos);
              dir.setMag(overlap);
              a.pos.add(dir);
              b.pos.sub(dir);
            }
          }
        }
      }
    }
  }

  //g for graphics
  render(g) {
    for (let iter = 0; iter < 5; iter++) {
      this.updateCountryParties();
    }
    for (const p of this.currentParties) {
      p.update();
      p.render(g);
    }
  }

  renderLabels() {
    for (const p of this.currentParties) {
      p.renderLabels();
    }
  }
}

function truncateToWidth(str, maxWidth, ellipsis = "...") {
  let truncated = str;
  while (textWidth(truncated + ellipsis) > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  return truncated.length < str.length ? truncated + ellipsis : str;
}
