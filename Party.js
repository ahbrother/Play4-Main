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
 
    this.labelPos = createVector(
      this.pos.x + random(0, 10),
      this.pos.y - random(0, 10),
    ); // Startposition
    this.labelVel = createVector(0, 0);
    this.labelCenter = createVector(width / 2, height / 2);
    //this.labelAngle = -HALF_PI + random(-10, 10); // Einstellen wie fest die labels nach links und rechts dürfen
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
  setPosition(position) {
    this.pos.set(position); // nur pos updaten, Sitze in Ruhe lassen
  }

  updateLabel() {
    // 1. Schwerpunkt der Sitze berechnen
    if (this.seats.length === 0) {
      return;
    } // sonst laufen wir dauernd in Warnmeldungen

    let center = createVector(0, 0);
    for (const seat of this.seats) {
      center.add(seat.pos);
    }
    center.div(this.seats.length);
    this.labelCenter = center;

    // 2. Anziehung zum Ankerpunkt (etwas ausserhalb des Schwerpunkts)
    let canvasCenter = createVector(width / 2, height / 2);
    //let dir = p5.Vector.add(center, canvasCenter);
    let dir = p5.Vector.fromAngle(this.labelAngle);
    //dir.normalize();
    dir.mult(map(this.seats.length, 0, 200, 20, 220)); //abstand vom mittelpunkt, evt mappen?

    let anchor = p5.Vector.add(center, dir);

    let attract = p5.Vector.sub(anchor, this.labelPos);
    attract.mult(0.03);
    this.labelVel.add(attract);

    // 3. Abstossung von jedem Sitz
    let away = p5.Vector.sub(this.labelPos, center);
    let d = away.mag();
    away.normalize();
    away.mult(100 / (d + 0.01));

    this.labelVel.add(away);

    // 4. Dämpfung & Update
    this.labelVel.mult(0.5);
    this.labelPos.add(this.labelVel);
  }

  updateData(data) {
    this.votes = data.votes;
  }

  getSeats() {
    return this.seats;
  }

  update() {
    // update the position. ensures, here we can edit how smooth the movement is
    if (this.attractor) {
      let force = p5.Vector.sub(this.attractor, this.pos);
      //let mappedForce = map(this.seats.length, 1, 200, 20, 900)
      //force.div(mappedForce);
      force.div(10);
      this.vel.add(force);
    }

    this.vel.mult(0.25);
    this.pos.add(this.vel);

    // springs claude, seats klasse mitgeben
    // **************** mit forces spielen, je kleiner desto schneller kommen sie ans ziel
    // Seats zum Partei-Zentrum anziehen
    for (const seat of this.seats) {
      let force = p5.Vector.sub(this.pos, seat.pos);

      let distForce = force.mag();
      let strength = map(distForce, 0, 200, 0.001, 0.03);
      force.setMag(strength * distForce);
      //force.div(params.forceDivide); // oder force.limit(x)

      let groupForce = p5.Vector.sub(this.pos, seat.pos);
      groupForce.setMag(3.5); //fixxe geschwindigkeit der ganzen Partei zum Zielort

      seat.vel.add(force);
      seat.vel.add(groupForce);
      seat.vel.mult(0.3); // seat.vel.limit(maxspeed)
      // seat.vel.limit(1.5);
      seat.pos.add(seat.vel);

      const xMin = 0;
      const xMax = width;
      seat.pos.x = constrain(seat.pos.x, xMin, xMax);
      seat.pos.y = constrain(seat.pos.y, 0, height - 200);
    }

    // Kollisionserkennung. vergleicht jedes Seat-Paar einmal miteinander
    // map(this.seats.length, 10, 200, 1.0, 0.25)
    for (let i = 0; i < this.seats.length; i++) {
      //j = i + 1 verhindert, dass etwas doppelt verglichen wird
      for (let j = i + 1; j < this.seats.length; j++) {
        let a = this.seats[i];
        let b = this.seats[j];

        //abstand zwischen den beiden Sitzen
        let d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        //mindest abstand
        let minDist = map(this.seats.length, 1, 200, 20, 40);
        //überlappen sie sich?
        if (d < minDist && d > 0) {
          //teilt es auf beide auf
          let overlap = (minDist - d) / 2;
          //richtung von a nach b
          let dir = p5.Vector.sub(a.pos, b.pos);
          //Vektoren auf Overlaplänge setzen
          dir.setMag(overlap);

          let pushStrength = map(this.seats.length, 1, 200, 1.0, 0.25);
          pushStrength = constrain(pushStrength, 0.25, 1.0);
          dir.mult(pushStrength);
          dir.limit(3.5);
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

  //g for graphics
  render(g) {
    color = familycolors[this.data.parfam];
    for (const seat of this.seats) {
      g.fill(color);
      //g.stroke(10,180);
      g.strokeWeight(0.5);
      g.rect(seat.pos.x, seat.pos.y, 30, 15);
    }
  }

  renderLabels() {
    this.updateLabel();

    // linie vom Zentrum der Sitze zu dem Label
    // stroke(255,120);
    // strokeWeight(2);
    // noFill();
    // bezier(this.labelCenter.x - 10, this.labelCenter.y - 10,this.labelCenter.x, this.labelCenter.y, this.labelPos.x, this.labelPos.y+8, this.labelPos.x - 10, this.labelPos.y - 10)

    textSize(15); // muss hierhin, damit sich w nicht verändern kann
    let s = this.data.partyname;
    let w = textWidth(s);
    //viereck hinter der Schrift
    fill(0, 180);
    rectMode(CENTER, CENTER);
    rect(this.labelCenter.x, this.labelCenter.y, w + 10, 20);
    //schriftzug
    fill("#ffffff");
    textAlign(CENTER);
    noStroke();
    text(this.data.partyname, this.labelCenter.x, this.labelCenter.y);
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
