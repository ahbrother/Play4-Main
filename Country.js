class Country {
  constructor(name, data, x, y) {
    this.name = name;
    this.data = data;
    this.pos = createVector(x, y);
    // console.log("data", data);
    this.ringRadius = 150;
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
    console.log(this.election);
    this.selectedYear = year;
    this._setElection(this.election.parties);
  }

  // change year triggers _setElection
  _setElection(ps) {
    // remove parties that no longer exist
    this.currentParties = this.currentParties.filter((p) => ps.some((pd) => pd.partyname === p.partyname));
    // update existing, add new
    ps.forEach((pd, i) => {
      const angle = (i / ps.length) * TWO_PI;
      const x = this.pos.x + cos(angle) * this.ringRadius;
      const y = this.pos.y + sin(angle) * this.ringRadius;

      const existing = this.currentParties.find((p) => p.partyname === pd.partyname);
      if (existing) {
        existing.data = pd;
        existing.moveTo(x, y);
        // maybe you need another idea for moveTo as it should map some values like rile?
      } else {
        this.currentParties.push(new Party(pd, x, y));
      }
    });
  }

  render() {
    text(this.name, width / 2, height / 2);
    text(this.election.year, width / 2, height / 2 + 20);
    text(this.election.parties.length, width / 2, height / 2 + 40);

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