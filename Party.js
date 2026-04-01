class Party {
  constructor(data, x, y, color) {
    this.data = data;
    this.pos = createVector(x, y);
    this.color = color;
    this.vel = createVector(random(-2, 2), random(-2, 2));
    this.attractor = null;

    // Seat-Partikel erstellen, damit jeder seat eine eigene Postion bekommt.
    this.seats = Array.from({ length: this.data.absseat }, () => ({
      pos: createVector(x + random(-20, 20), y + random(-20, 20)),
      vel: createVector(random(-1, 1), random(-1, 1)),
    }));
    //console.log("Sitze", this.seats)
  }

  updateSeats(newCount) {
    const diff = newCount - this.seats.length;

    if (diff > 0) {
      // Sitze hinzufügen
      for (let i = 0; i < diff; i++) {
        this.seats.push({
          pos: createVector(
            this.pos.x + random(-20, 20),
            this.pos.y + random(-20, 20),
          ),
          vel: createVector(random(-1, 1), random(-1, 1)),
        });
      }
    } else if (diff < 0) {
      // Sitze entfernen
      this.seats.splice(diff); // entfernt die letzten |diff| Sitze
    }
  }

  updateData(data) {
    this.votes = data.votes;
  }

  getSeats() {
    return this.seats;
  }

  update() {
    // update some vars like pos easing or what ever…
    if (this.attractor) {
      let force = p5.Vector.sub(this.attractor, this.pos);
      //let mappedForce = map(this.seats.length, 1, 200, 20, 900)
      //force.div(mappedForce);
      force.div(5);
      this.vel.add(force);
    }

    this.vel.mult(0.25);
    this.pos.add(this.vel);

    // springs claude, seats klasse mitgeben
    // **************** mit forces spielen, je kleiner desto schneller kommen sie ans ziel
    // Seats zum Partei-Zentrum anziehen
    for (const seat of this.seats) {
      let force = p5.Vector.sub(this.pos, seat.pos);
      force.div(params.forceDivide); // oder force.limit(x)
      //force.limit(2);

      // let dist=force.mag()
      // if(dist<30){
      //   force.limit(1)
      // }

      seat.vel.add(force);
      seat.vel.mult(0.5); // seat.vel.limit(maxspeed)
      //seat.vel.limit(2);
      seat.pos.add(seat.vel);


      const xMin = 0;
      const xMax = windowWidth / 2;
      seat.pos.x = constrain(seat.pos.x, xMin, xMax);
      seat.pos.y = constrain(seat.pos.y, 0, windowHeight);
    }

    // Kollisionserkennung. vergleicht jedes Seat-Paar einmal miteinander
    for (let i = 0; i < this.seats.length; i++) {
      //j = i + 1 verhindert, dass etwas doppelt verglichen wird
      for (let j = i + 1; j < this.seats.length; j++) {
        let a = this.seats[i];
        let b = this.seats[j];

        //abstand zwischen den beiden Sitzen
        let d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        //mindest abstand
        let minDist = 19;
        //überlappen sie sich?
        if (d < minDist && d > 0) {
          //teilt es auf beide auf
          let overlap = (minDist - d) / 2;
          //richtung von a nach b
          let dir = p5.Vector.sub(a.pos, b.pos);
          //Vektoren auf Overlaplänge setzen
          dir.setMag(overlap);
          // a und b wegstossen
          a.pos.add(dir);
          b.pos.sub(dir);
        }
      }
    }
  }

  moveTo(x, y) {
    // here move or ease or whatever.like:setTarget. but now jump:
    this.attractor = createVector(x, y);
  }

  render() {
    color = familycolors[this.data.parfam];
    push();
    const isRight = this.side === "right";
    if (isRight) {
      translate(windowWidth / 2, 0);
    }

    /* *********************
    Hier müssen wir sicherstellen dass sich die einzelnen Parteipositionen nicht überlappen, sondern aneinander vorbeigehen!!!
    */
    for (const seat of this.seats) {
      fill(color);
      stroke(0);
      rect(seat.pos.x, seat.pos.y, 30, 15);
    }

    fill("#ffffff");
    textAlign(CENTER);
    textSize(15);
    text(this.data.partyname, this.pos.x, this.pos.y);
    pop();
  }

  setAttractor(v) {
    this.attractor = v;
  }
}

/*
Auf der höheren Ebene Wählen wir das Land und das Jahr. Das heisst, hier brauchen wir die Anzahl und Namen der Einzelnen Parteien in diesem Land zu dem Zeitpunkt.
Evt kommt hier später noch Force etc dazu.

Dazu brauchen wir:
– ein Array mit allen aktuellen Parteinamen (plus evt anzahl sitze und rile-wert für force?)

*/
