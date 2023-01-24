class Canvas {
    static WIDTH = 1200;
    static HEIGHT = 900;
    static BACKGROUND_COLOR = "#051937";

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvas.width = Canvas.WIDTH;
        this.canvas.height = Canvas.HEIGHT;
    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = Canvas.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
    }
    drawLine(vectorFrom, vectorTo, w = 4) {
        const { x: x1, y: y1 } = vectorFrom.position;
        const { x: x2, y: y2 } = vectorTo.position;

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineWidth = w;
        this.ctx.strokeStyle = vectorTo.color;
        this.ctx.stroke();
        this.ctx.closePath();
    }
    /**
     * @param {Particle | ParticleTrace} trace
     **/
    drawPoint(trace, r = 4) {
        const { x, y } = trace.position;
        this.ctx.beginPath();

        if (trace.color) {
            this.ctx.fillStyle = trace.color;
        }

        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.closePath();
    }
    drawCircle(vector, r) {
        const { x, y } = vector;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
    drawText(x, y, text) {
        this.ctx.font = "24px serif";
        this.ctx.fillText(text, x + 20, y + 20);
    }
    drawRect(x, y, width, height, r = 0, g = 0, b = 0) {
        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.ctx.fillRect(x, y, width, height);
    }
}

const canvasEl = document.getElementById("canvas");

const canvas = new Canvas(canvasEl);

class Color {
    random() {
        this.r = Math.floor(Math.random() * 255);
        this.g = Math.floor(Math.random() * 255);
        this.b = Math.floor(Math.random() * 255);
        this.a = 1;

        return this;
    }
    constructor(r=255, g=255, b=255) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = 1;
    }
    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
    copy() {
        const newColor = new Color();
        
        newColor.r = this.r;
        newColor.g = this.g;
        newColor.b = this.b;
        newColor.a = this.a;
        
        return newColor;
    }
}

class ParticleTrace {
    constructor(x, y, color=new Color()) {
        this.position = new Vector(x, y);
        this.color = color;
    }
}

class Particle extends ParticleTrace {
    constructor(x, y, color) {
        super(x, y, color);

        this.v = new Vector(0, 0);
        this.a = new Vector(0, 0);
        this.lifeFrames = 0;
        this.explosive = false;
        // this.removeAfterFrames = 0;

        this.maxLifeFrames = 0;

        this.traceLength = 10;
        this.traces = [new ParticleTrace(this.position.x, this.position.y, this.color)];
        this.lineWidth = 2;

        // skips adding traces # increasing fpc
        this.passTrace = 1;
        // this.addTrace();
    }

    get isDied() { return this.lifeFrames > this.maxLifeFrames };
    get isTooLong() { return this.traces.length * this.passTrace > this.traceLength };
    get enableAdding() { return this.lifeFrames % this.passTrace === 0 };

    update() {
        if (
            this.isDied || 
            this.isTooLong
        ) {
            this.traces.shift();
        } else {
            if (this.enableAdding) {
                this.addTrace();
            }
        }
        
        // particles.push(this.position);

        this.v = this.v.add(this.a);
        this.position = this.position.add(this.v);

        this.lifeFrames += 1;
    }

    addTrace() {
        const color = this.color.copy();

        color.a = this.maxLifeFrames / this.lifeFrames / 2;

        this.traces.push(
            new ParticleTrace(this.position.x, this.position.y, color)
        );
    }

    removeDiedTrace() {
        if (!this.isDied) return;
    
        if (particles.lenght < 1000 && this.lifeFrames % 4 !== 0) {
            return 
        };

        this.traces.shift(); 
    }
}


class Charge {
    static EFFECTS = [
        'heart'
    ]

    constructor({
        position = new Vector(0, 0),
        velocity = new Vector(
            (Math.random() * 2) * Math.sign(Math.random() - 0.5),
            -6
        ),
        acceleration = new Vector(0, 0),
        count = 100 + 200 * Math.random(),
        color = new Color().random(),
        particleMaxLifeFrames = 40 + Math.floor(80 * Math.random()),
        traceLength = 10,
        explosionY = (Canvas.HEIGHT / 2) - (Canvas.HEIGHT / 3) * Math.random(),
        particleMinTraceLength = 5,
        particleMaxTraceLength = 10,
        index = 0,
        nestExplosion = false,
        chargeRadius = 4,
        particlePassTrace = 1,
        effect = null,
    }) {
        this.color = color;
        this.position = position;

        this.count = count;
        this.particleMaxLifeFrames = particleMaxLifeFrames;
        this.particleMinTraceLength = particleMinTraceLength;
        this.particleMaxTraceLength = particleMaxTraceLength
    
        this.v = velocity;
        this.a = acceleration;
        this.index = index;

        this.traceLength = traceLength;
        this.explosionY = explosionY;
        this.nestExplosion = nestExplosion;
        this.chargeRadius = chargeRadius;
        this.particlePassTrace = particlePassTrace;
        this.effect = effect;

        this.traces = [];
    }

    explosion = () => {
        const { x, y } = this.position;
        const randomEffectChance = Math.random();
        
        const angleStep = 360 / this.count;
    
        for (let i = 0; i < this.count; i++) {
            const angle = Vector.toRadians(angleStep * i);
            const particle = new Particle(x, y, this.color.copy());

            particle.maxLifeFrames = this.particleMaxLifeFrames;
            particle.explosive = this.nestExplosion;
            particle.passTrace = this.particlePassTrace;
    
            const randVScale = 2 * Math.random();
            const randARotate = Math.random() * Math.PI / 2;
    
            particle.traceLength = this.particleMinTraceLength + Math.floor(this.particleMaxTraceLength * Math.random());
    
            particle.v = new Vector(
                Math.cos(angle), Math.sin(angle)
            ).scaleBy(randVScale);
    
            // random trajectory for particles 
            particle.a = new Vector(
                Math.cos(angle), Math.sin(angle)
            ).scaleBy(0.01).rotate(randARotate);

            // heart shape generating
            this.applyEffect(particle, angle);
    
            if (randomEffectChance > 0.9) {
                particle.color = new Color().random()
            }        
    
    
            particles.push(particle);
        }
        
    };

    applyEffect(particle, angle) {
        if (this.effect === Charge.EFFECTS[0]) {
            particle.color.r = 155 + Math.floor(Math.random() * 100);
            particle.color.g = Math.floor(Math.random() * 50);
            particle.color.b = Math.floor(Math.random() * 50);
            
            particle.v = new Vector(
                Math.cos(angle), Math.sin(angle)
            ).scaleBy(2);
    
            if (particle.v.y > 0) {
                particle.v.y = Math.sqrt(1 - (Math.abs(particle.v.x) - 1) ** 2);    
            } else {
                particle.v.y = Math.acos(1 - Math.abs(particle.v.x)) - Math.PI;
            }
    
            particle.v = particle.v.scaleBy(-1);
        }
    }

    update() {
        if (this.traces.length > this.traceLength) {
            this.traces.shift();
        } else {
            this.addTrace();
        }

        if (this.position.y < this.explosionY) {
            this.explosion();

            const indexRemove = charges.findIndex(el => el.index === this.index);

            charges.splice(indexRemove, 1);

            return;
        }

        this.v = this.v.add(this.a);
        
        this.position = this.position.add(this.v);

        // sine wave effect
        // const sine = Math.sin(this.position.y / 40) * 0.3;
        // this.position.x += sine;
    }

    addTrace() {
        const color = this.color.copy();

        this.traces.push(
            new ParticleTrace(this.position.x, this.position.y, color)
        );
    }
}

// class Charges {
//     constructor() {
//         this.charges = [];
//         this.index = 0;
//     }

//     add(x, y) {
//         const charge = new Charge(x, y, new Color().random());
//         charge.index = this.index;
//         this.index++;
//         this.charges.push(charge);
//     }

//     update() {
//         this.charges.forEach((charge) => {
//             charge.update();
//         });
//     }
// }

let particles = [];
let charges = [];

const applyGravity = (particle) => {
    particle.v = particle.v.add(new Vector(0, 0.01));
};

const removeDeadParticles = () => {
    const removeAfter = -20;
    const removeType = "random";
    const removeByCount = 2;
    particles = particles.filter((particle) => {
        particle.removeDiedTrace(); 

        if (particle.traces.length === 0 && particle.explosive) {
            const charge = new Charge({
                position: particle.position,
                index: charges.length - 1,
                count: 30,
                particleMaxLifeFrames: 20 + Math.floor(20 * Math.random()),
                traceLength: 0,
                explosionY: Infinity,
                particleMinTraceLength: 1,
                particleMaxTraceLength: 3,
                particlePassTrace: 3,
                color: particle.color,
                index: 0,
            });
        
            charges.push(charge);
        }

        return particle.traces.length;
    });
};

// const removeDeadCharges = () => {
//     charges = charges.filter((charge) => {
//         return charge.position.y > charge.explosionY;
//     });
// };


const addCharge = (x, y) => {
    const isNestedCharge = Math.random() > 0.7;
    const isHarthEffect = Math.random() > 0.7;

    const charge = new Charge({
        position: new Vector(x, y),
        particleMinTraceLength: 4,
        particleMaxTraceLength: 14,
        index: charges.length - 1,
        particlePassTrace: 3,  
    });

    if (isNestedCharge) {
        charge.nestExplosion = true;
        charge.chargeRadius = 8;
    }

    if (isHarthEffect) {
        charge.effect = Charge.EFFECTS[0];
    }


    charges.push(charge);
}

canvasEl.addEventListener("mousedown", (e) => {
    const { offsetX, offsetY } = e;

    addCharge(offsetX, offsetY);
});


canvasEl.addEventListener("touchstart", (e) => {
    const { clientX, clientY } = e.touches[0];

    addCharge(clientX, clientY);
});

const frame = () => {
    canvas.clear();
    removeDeadParticles();
    // removeDeadCharges();

    for (let p = 0; p < particles.length; p++) {
        const particle = particles[p];

        applyGravity(particle);
        
        for (let t = 0; t < particle.traces.length; t++) {
            const traceCurr = particle.traces[t];
            const traceNext = particle.traces[t + 1];

            if (particle.lifeFrames < particle.maxLifeFrames) {
                if (traceNext) {
                    canvas.drawLine(traceCurr, traceNext, particle.lineWidth);
                } else {
                    // first trace to head
                    canvas.drawLine(particle, traceCurr, particle.lineWidth);
                }

                continue;
            }
            // trace after die
            canvas.drawPoint(traceCurr, 1.1);
        }

        // head Point
        canvas.drawPoint(particle, 1.1);

        particle.update();
    }

    for (let c = 0; c < charges.length; c++) {
        const charge = charges[c];
        applyGravity(charge);

        canvas.drawPoint(charge, charge.chargeRadius);

        for (let t = 0; t < charge.traces.length; t++) {
            const traceCurr = charge.traces[t];

            canvas.drawPoint(traceCurr, (
                (t + 1) / charge.traces.length
            ) * charge.chargeRadius);
        }

        charge.update();

        // canvas.drawPoint(charge, 5);
    }

    requestAnimationFrame(frame);
};

frame();
