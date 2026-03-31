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
    this.currentParties = []; // ← add this
    this._setElection(this.election.parties);
  }

  setPosition(position) {
    this.pos.set(position);
  }

  setYear(year) {
    // Find closest year
    this.election = this.elections.reduce((prev, curr) =>
      Math.abs(curr.year - year) < Math.abs(prev.year - year) ? curr : prev,
    );
    console.log("ELection:", this.election);
    this.selectedYear = year;
    this._setElection(this.election.parties);
    //console.log("einzelne Parteien:", this.election.parties)
  }

  // change year triggers _setElection
  _setElection(ps) {
    // remove parties that no longer exist
    this.currentParties = this.currentParties.filter((p) =>
      ps.some((pd) => pd.partyname === p.data.partyname),
    );
    console.log("currentParties", this.currentParties);

    // brauchen wir um später abzufragen ob das Land rechts oder links ist
    const isRight = this.side === "right";
    // update existing, add new
    ps.forEach((pd, i) => {
      //const angle = (i / ps.length) * TWO_PI;
      const x = map(
        this.election.parties[i].rile,
        -100,
        100,0,windowWidth/2
       // isRight ? windowWidth / 2 : 0,
       // isRight ? windowWidth : windowWidth / 2,
      ); //this already places the rects according to the rile scale. ist eine doppelfunktion: wenn das land links ist, dann wird es von 0 bis mitte gemappt (1. Fall), wenn es recht ist, wird es von der mitte bis ans ende gemappt(2. Fall)

      const y = map(
        this.election.parties[i].absseat,
        0,
        this.election.parties[i].totseats/1.5,
        windowHeight - 30,
        0,
      ); //jetzt mapped mer d ahzahl sitz pro partei vo 0 zu de mehrheit im Parlament. Sprich wenn en Partei d mehrheit het, isch sie obe
      console.log(this.currentParties)
      const existing = this.currentParties.find(
        (p) => p.data.partyname === pd.partyname,
      );
      if (existing) {
        existing.data = pd;
        existing.side = this.side;
        existing.moveTo(x, y);
        existing.updateSeats(pd.absseat); //neu?!
      } else {
        let p = new Party(pd, x, y, color);
        p.side = this.side;
        this.currentParties.push(p);
        //this.currentParties.push(new Party(pd, x, y, color));
      }
    });
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

  render() {

    //rect(this.pos.x,this.pos.y,5)
    const labelX = this.side === "right" ? windowWidth / 2 + 10 : 10;
    fill(255);
    text(this.name, labelX, 20);
    text(this.election.year, labelX, 40);
    text(this.election.parties.length, labelX, 60);

    for (let iter = 0; iter < 5; iter++) {
      this.updateCountryParties();
    }
    for (const p of this.currentParties) {
      p.update();
      p.render();
    }
  }
}

/*
Hier generieren wir die entsprechenden Partikelsysteme.
Anzahl Sitze = Anzahl Rechtecke
*/
