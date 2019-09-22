const GRAVITY = 0.9;
const BOUNCYNESS = 0.9;
const EYE_COLORS = ['#d26f78', '#7c6daa', '#d55f98', '#a52361', '#b956b7', '#9176b7'];

/*------------------------------*\
                                                                                       |* Main Canvas
                                                                                       \*------------------------------*/

class Canvas {
  constructor() {
    // setup a canvas
    this.canvas = document.getElementById('eye-canvas');
    this.dpr = window.devicePixelRatio || 1;
    // this.dpr = 1;


    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(this.dpr, this.dpr);

    this.floor = window.innerHeight * this.dpr - window.innerHeight / 15 * this.dpr;
    this.mouse = {
      x: 0,
      y: 0 };



    this.setCanvasSize = this.setCanvasSize.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleMouse = this.handleMouse.bind(this);
    this.render = this.render.bind(this);

    this.setCanvasSize();
    this.setupListeners();

    this.eyes = [];

    const amount = 15;
    for (let i = 0; i < amount; i++) {
      const size = getRandomInt(this.canvas.width / 12 / this.dpr, this.canvas.width / 8 / this.dpr);
      const x = getRandomInt(this.canvas.width, 0);
      const y = getRandomInt(this.canvas.height, 0);
      const eye = new Eye(this, size, x, y);
      this.eyes.push(eye);
    }

    this.render();
  }

  setupListeners() {
    window.addEventListener('resize', this.setCanvasSize);
    window.addEventListener('click', this.handleClick);
    window.addEventListener('mousemove', this.handleMouse);
  }

  handleClick(event) {
    const x = event.clientX;
    const y = event.clientY;
    this.eyes.forEach(eye => {
      eye.bounceY(getDistance(x, y, eye.x, eye.y) / 50 + 20 * this.dpr);
    });
  }

  handleMouse(event) {
    const x = event.clientX * this.dpr;
    const y = event.clientY * this.dpr;
    this.mouse = { x, y };
  }

  setCanvasSize() {
    this.canvas.width = window.innerWidth * this.dpr;
    this.canvas.height = window.innerHeight * this.dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
  }

  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0);
    gradient.addColorStop(0, '#9089e6');
    gradient.addColorStop(1, '#5b3cb1');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // const size = this.canvas.width / 14;
    // this.ctx.font = `bold ${size}px Futura`;
    // this.ctx.textAlign = 'center';
    // this.ctx.fillStyle = 'white';
    // this.ctx.fillText('BOUNCY BALLS', this.canvas.width / 2, this.canvas.height / 2);
  }


  render() {
    this.drawBackground();

    // show ground
    // this.ctx.fillStyle = '#f6f893';
    // this.ctx.fillRect(0, this.floor, this.canvas.width, this.canvas.height + this.canvas.height - this.floor);
    this.eyes.forEach(eye => {

      const angle = getAngleRadians(this.mouse.x, this.mouse.y, eye.x, eye.y);
      const distance = scaleBetween(getDistance(this.mouse.x, this.mouse.y, eye.x, eye.y), 0, eye.maxEyeOffset, 0, 400);
      const maxDistance = clamp(distance, 0, eye.maxEyeOffset);
      const point = movePointAtAngle({ x: eye.cx, y: eye.cy }, angle, maxDistance);
      eye.updatePupil(point);

      eye.draw();
      eye.updatePosition();
    });

    window.requestAnimationFrame(this.render);
  }}


/*------------------------------*
      * Eye Canvas
      *------------------------------*/

class Eye {
  constructor(canvas, size, x, y) {
    this.canvas = canvas;

    this.draw = this.draw.bind(this);

    this.color = EYE_COLORS[getRandomInt(0, 5)];


    // radius axis
    this.ry = size * canvas.dpr;
    this.rx = size * canvas.dpr;

    // position
    this.x = x;
    this.y = y;

    // velocity
    this.vx = getRandomInt(-10, 10) * this.canvas.dpr;
    this.vy = getRandomInt(-10, -20) * this.canvas.dpr;

    // deltas
    this.dx = 0;
    this.dy = 0;

    this.distFromGround = this.canvas.floor - this.x;

    // eye
    this.cx = this.rx / 2;
    this.cy = this.ry / 2;

    // pupil
    this.px = this.rx / 2;
    this.py = this.ry / 2;

    this.maxEyeOffset = this.rx / 5;

    this.setupEye();
    this.setupShadow();
    this.draw();
  }

  updatePupil(point) {
    this.px = point.x;
    this.py = point.y;
  }

  updatePosition() {

    const floorOffset = this.canvas.floor - this.ry / 2; // adjusted for ball radius
    const nextY = this.y + GRAVITY * this.canvas.dpr + this.vy;
    const nextX = this.x + this.vx;

    // floor check
    if (nextY >= floorOffset) {
      this.y = floorOffset;
      this.dy = 0;
      this.bounceY();
    } else {
      this.vy = GRAVITY * this.canvas.dpr + this.vy;
      this.dy = Math.abs(nextY - this.y);
      this.y = nextY;
    }

    // wall check
    if (nextX >= this.canvas.canvas.width - this.rx ||
    nextX <= this.rx) {
      this.dx = 0;
      this.bounceX();
    } else {
      this.dx = Math.abs(nextX - this.x);
      this.x = nextX;
    }


    // total distance
    const distFromGround = this.canvas.floor - this.y - this.ry;
    const distMax = this.canvas.canvas.height - this.canvas.canvas.height + this.canvas.floor;
    const distCapped = clamp(distFromGround, 0, distMax);

    // set shadow properties
    this.shadowOpacity = scaleBetween(distCapped, 1, 0, 0, distMax);
    this.shadowWidth = scaleBetween(distCapped, 0.9, 6, 0, distMax);

    this.stretchY = scaleBetween(this.dy, 0.99, 1.03, 0, 10);
  }

  bounceY(vy) {
    this.vy = vy ? vy : -this.vy * BOUNCYNESS;
    this.y += this.vy;
  }

  bounceX() {
    this.vx = -this.vx * BOUNCYNESS;
    this.x += this.vx;
  }

  setupShadow() {
    this.shadowCanvas = document.createElement('canvas');
    this.shadowCtx = this.shadowCanvas.getContext('2d');
    this.shadowCtx.scale(this.canvas.dpr, this.canvas.dpr);

    this.shadowCanvas.width = this.rx;
    this.shadowCanvas.height = this.ry;

    const gradient = this.shadowCtx.createRadialGradient(this.rx / 2, this.ry / 2, this.rx / 2, this.rx / 2, this.ry / 2, 0);
    gradient.addColorStop(1, 'rgba(69, 19, 144, 0.15)');
    gradient.addColorStop(0, 'rgba(69, 19, 144, 0)');
    this.shadowCtx.fillStyle = gradient;
    this.shadowCtx.fillRect(0, 0, this.rx, this.ry);
  }

  drawShadow() {
    const width = this.rx * this.shadowWidth;
    const x = this.x - width / 2;
    const height = this.ry / 1.5;
    const y = this.canvas.floor - height / 2;

    this.canvas.ctx.globalAlpha = this.shadowOpacity;
    this.canvas.ctx.drawImage(this.shadowCanvas, x, y, width, height);
    // this.canvas.ctx.fillRect(x, y, width, height);
    this.canvas.ctx.globalAlpha = 1;
  }

  setupEye() {
    this.eyeCanvas = document.createElement('canvas');
    this.eyeCtx = this.eyeCanvas.getContext('2d');
    this.eyeCtx.scale(this.canvas.dpr, this.canvas.dpr);

    this.eyeCanvas.width = this.rx;
    this.eyeCanvas.height = this.ry;
  }

  draw() {
    this.eyeCtx.clearRect(0, 0, this.eyeCanvas.width, this.eyeCanvas.height);

    // whites
    this.eyeCtx.fillStyle = 'white';
    this.eyeCtx.beginPath();
    this.eyeCtx.arc(this.rx / 2, this.ry / 2, this.rx / 2, 0, 2 * Math.PI);
    this.eyeCtx.fill();

    // stroke
    const lineWidth = 2 * this.canvas.dpr;
    this.eyeCtx.lineWidth = lineWidth;
    this.eyeCtx.strokeStyle = '#444';
    this.eyeCtx.beginPath();
    this.eyeCtx.arc(this.rx / 2, this.ry / 2, this.rx / 2 - lineWidth / 2, 0, 2 * Math.PI);
    this.eyeCtx.stroke();

    // pupil center
    const px = this.px;
    const py = this.py;

    // color
    this.eyeCtx.fillStyle = this.color;
    this.eyeCtx.beginPath();
    this.eyeCtx.arc(this.px, this.py, this.rx / 4, 0, 2 * Math.PI);
    this.eyeCtx.fill();
    this.eyeCtx.stroke();

    // radial lines
    // center
    const cx = this.eyeCanvas.width / 2;
    const cy = this.eyeCanvas.height / 2;

    // inner/outer radius
    const or = this.eyeCanvas.width / 4 - lineWidth;
    const ir = this.eyeCanvas.width / 8 + lineWidth;

    let i = 0;
    const increment = 15;
    while (i <= 360 - increment) {

      // end points
      const x2 = this.px + or * Math.cos(i * Math.PI / 180);
      const y2 = this.py + or * Math.sin(i * Math.PI / 180);
      // begin points
      const x1 = this.px + ir * Math.cos(i * Math.PI / 180);
      const y1 = this.py + ir * Math.sin(i * Math.PI / 180);

      this.eyeCtx.strokeStyle = 'white';
      this.eyeCtx.lineWidth = lineWidth;
      this.eyeCtx.beginPath();
      this.eyeCtx.moveTo(x1, y1);
      this.eyeCtx.lineTo(x2, y2);
      this.eyeCtx.stroke();
      i += increment;
    }

    // color
    this.eyeCtx.fillStyle = '#333';
    this.eyeCtx.beginPath();
    this.eyeCtx.arc(this.px, this.py, this.rx / 8, 0, 2 * Math.PI);
    this.eyeCtx.fill();


    this.drawShadow();


    // this.eyeCtx.fillRect(0, 0, this.eyeCanvas.width, this.eyeCanvas.height);

    const width = this.eyeCanvas.width;
    const x = this.x - width / 2;
    const height = this.eyeCanvas.height;
    const y = this.y - height / 2;

    this.canvas.ctx.drawImage(this.eyeCanvas, x, y, width, height * this.stretchY);
  }}



function movePointAtAngle(point, angle, distance) {
  return {
    x: point.x - Math.cos(angle) * distance,
    y: point.y - Math.sin(angle) * distance };

}

function getAngleRadians(x0, y0, x1, y1) {
  // radians = atan2(deltaY, deltaX)
  const y = y1 - y0;
  const x = x1 - x0;
  return Math.atan2(y, x);
}

function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max) {
  return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
}

function getDistance(x0, y0, x1, y1) {
  const x = x1 - x0;
  const y = y1 - y0;
  return Math.sqrt(x * x + y * y);
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


const canvas = new Canvas();