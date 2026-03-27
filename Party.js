class Party {
  constructor(data, x, y) {
    this.data = data;
    this.pos = createVector(x, y);
  }

  updateData(data) {
    this.votes = data.votes;
  }

  update() {
    // update some vars like pos easing or what ever…
  }

  moveTo(x, y) {
    // here move or ease or whatever.like:setTarget. but now jump:
    this.position.set(x, y);
  }

  render() {
    push();
    translate(this.pos.x, this.pos.y);

    // seat ring around the party position
    let radius = (this.data.absseat * 5) / TWO_PI;
    fill(200, 100, 100);
    for (let i = 0; i < this.data.absseat; i++) {
      let angle = (TWO_PI / this.data.absseat) * i;
      circle(cos(angle) * radius, sin(angle) * radius, 5);
    }
    fill(0);
    ellipse(0, 0, 10);
    textAlign(CENTER);
    text(this.data.partyname, 0, 20);
    pop();
  }
}


/*
Auf der höheren Ebene Wählen wir das Land und das Jahr. Das heisst, hier brauchen wir die Anzahl und Namen der Einzelnen Parteien in diesem Land zu dem Zeitpunkt.
Evt kommt hier später noch Force etc dazu.

Dazu brauchen wir:
– ein Array mit allen aktuellen Parteinamen (plus evt anzahl sitze und rile-wert für force?)

*/