class Canvas {
    static WIDTH = 1200;
    static HEIGHT = 900;

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvas.width = Canvas.WIDTH;
        this.canvas.height = Canvas.HEIGHT;

    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = "#37425B";
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
     * @param {Particle | ParticleTrace} particle
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
        this.removeAfterFrames = 0;
        this.maxLifeFrames = 0;

        this.traces = [];

        this.addTrace();
    }
    update() {
        this.lifeFrames--;

        if (this.lifeFrames < 0) {
            return;
        }
        // particles.push(this.position);
        this.addTrace()

        this.v = this.v.add(this.a);
        this.position = this.position.add(this.v);
    }

    addTrace() {
        const color = new Color();
        color.r = this.color.r;
        color.g = this.color.g;
        color.b = this.color.b;
        color.a = this.lifeFrames / this.maxLifeFrames * 5;

        this.traces.push(
            new ParticleTrace(this.position.x, this.position.y, color)
        );
    }

    removeRandomTrace() {
        if (this.lifeFrames > this.removeAfterFrames) return;
        
        // if (this.lifeFrames % 3 !== 0) {
        //     return 
        // };
        const randPos = Math.floor(Math.random() * this.traces.length);

        this.traces.splice(randPos, 1); 
    }
}


const explosion = (charge) => {
    const {x, y} = charge.position;
    const color = charge.color;
    const count = 30 + 30 * Math.random();
    const angleStep = 360 / count;
    const maxLifeFrames = 40 + Math.floor(80 * Math.random());
    // const color = new Color().random();
    const removeAfterFrames = -20;

    for (let i = 0; i < count; i++) {
        const angle = Vector.toRadians(angleStep * i);
        const particle = new Particle(x, y, color);

        particle.lifeFrames = maxLifeFrames;
        particle.maxLifeFrames = maxLifeFrames;

        particle.removeAfterFrames = removeAfterFrames;


        const randVScale = 2 + 0.1 * Math.random();
        const randARotate = Math.random() * Math.PI / 2;

        particle.v = new Vector(
            Math.cos(angle), Math.sin(angle)
        ).scaleBy(randVScale);

        particle.a = new Vector(
            Math.cos(angle), Math.sin(angle)
        ).scaleBy(0.01).rotate(randARotate);

        particles.push(particle);
    }
};

class Charge extends ParticleTrace {
    constructor(x, y, color) {
        super(x, y, color);

        this.v = new Vector(
            (Math.random() * 2) * Math.sign(Math.random() - 0.5),
             -6);
        this.a = new Vector(0, 0);
        this.index = 0;

        this.maxTraceLength = 4;
        this.maxHeight = (Canvas.HEIGHT / 2) - (Canvas.HEIGHT / 3) * Math.random();
        this.traces = [];
    }

    update() {
        if (this.traces.length > this.maxTraceLength) {
            this.traces.shift();
        } else {
            this.addTrace();
        }

        if (this.position.y < this.maxHeight) {
            explosion(this);
            const indexRemove = charges.findIndex(el => el.index === this.index)
            charges.splice(indexRemove, 1);

            return;
        }

        this.v = this.v.add(this.a);
        this.position = this.position.add(this.v);
    }

    addTrace() {
        const color = new Color();
        color.r = this.color.r;
        color.g = this.color.g;
        color.b = this.color.b;
        color.a = this.maxTraceLength / this.traces.length * 0.8;

        this.traces.push(
            new ParticleTrace(this.position.x, this.position.y, color)
        );
    }
}

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
        particle.removeRandomTrace(); 

        return particle.traces.length;
    });
};

// const removeDeadCharges = () => {
//     charges = charges.filter((charge) => {
//         return charge.position.y > charge.maxHeight;
//     });
// };




canvasEl.addEventListener("mousedown", (e) => {
    const { offsetX: x, offsetY: y } = e;
    
    const charge = new Charge(x, y, new Color().random());
    charge.index = charges.length - 1;
    charges.push(charge);
    // explosion(x, y);
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

            if (traceNext && particle.lifeFrames > particle.removeAfterFrames) {
                canvas.drawLine(traceCurr, traceNext, 2);

                continue;
            }

            canvas.drawPoint(traceCurr, 1.1);
        }

        particle.update();
    }

    for (let c = 0; c < charges.length; c++) {
        const charge = charges[c];
        applyGravity(charge);

        canvas.drawPoint(charge, 4);


        for (let t = 0; t < charge.traces.length; t++) {
            const traceCurr = charge.traces[t];

            canvas.drawPoint(traceCurr);
        }

        charge.update();

        // canvas.drawPoint(charge, 5);
    }

    requestAnimationFrame(frame);
};

frame();
