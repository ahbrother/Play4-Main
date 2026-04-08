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
    //console.log("currentParties", this.currentParties);

    // brauchen wir um später abzufragen ob das Land rechts oder links ist
    const isRight = this.side === "right";
    // update existing, add new
    ps.forEach((pd, i) => {

      const x = map(pd.rile, -100, 100, 0, width);
      const y = map(pd.absseat, 0, pd.totseats / 6 * 5, windowHeight-400,0);
      
      const existing = this.currentParties.find(
        (p) => p.data.partyname === pd.partyname,
      );
      if (existing) {
        existing.data = pd;
        existing.side = this.side;
        existing.moveTo(x, y);
        existing.updateSeats(pd.absseat); //neu?!
      } else {
        console.log("neue Partei bei:", x, y)
        let p = new Party(pd, x, y, color);
        p.side = this.side;
        this.currentParties.push(p);
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

  renderLabels(){
    for (const p of this.currentParties){
      p.renderLabels();
    }
  }
}

/*
Hier generieren wir die entsprechenden Partikelsysteme.
Anzahl Sitze = Anzahl Rechtecke
*/
