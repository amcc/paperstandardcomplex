import { createNoise3D } from "./simplex-noise.js";
const noise3D = createNoise3D();

let zoff = 0;
let circumference;
let desiredLength;

const radDivisions = 14;
const stringWidth = 0.8;
const stringGap = 8;

let phase = 0;
let wobble = 0;
const wobbleInc = 0.019;
const phaseInc = 0.0001;
const zoffInc = 0.0006;
const circleNumber = 4070;

let pathGroup;
let pathsArray = [];

// let
//  taken from paper.js docs http://paperjs.org/tutorials/getting-started/using-javascript-directly/
paper.install(window);
window.onload = function () {
  // let height = paper.project.view.viewSize.height;

  //paper setup
  paper.setup("myCanvas");
  let width = paper.view.size.width;
  let height = paper.view.size.height;

  desiredLength = Math.min(width, height) * 2.2;

  for (let i = 0; i < circleNumber; i++) {
    let path = new paper.Path();

    path.applyMatrix = false;

    path.strokeColor = "black";
    path.strokeWidth = stringWidth;

    pathsArray[i] = path;
    makeCircle(path, width, height, wobble, true, true);
    wobble += wobbleInc;
  }

  view.onFrame = function (event) {
    if (event.count % 2 === 0) {
      // paper.project.activeLayer.removeChildren();
      wobble = 0;
      for (let i = 0; i < circleNumber; i++) {
        makeCircle(pathsArray[i], width, height, wobble, true);
        wobble += wobbleInc;
      }
      phase += phaseInc;
      zoff += zoffInc;
      // console.log(paper);
    }
  };
  // if not doing animation then use this to draw
  //view.draw();
};

const makeCircle = (
  path,
  width,
  height,
  wobble,
  close = false,
  create = false
) => {
  const gap = close ? 0 : stringGap;

  circumference = 0;
  let prevX, prevY;
  // p5.stroke(0);
  // p5.noFill();
  // p5.strokeWeight((stringWeight * p5.width) / 1580);
  // p5.strokeWeight(stringWeight);
  // p5.strokeCap(p5.ROUND);
  // p5.noFill();

  // shift shapes across by radius
  const add = desiredLength / Math.PI;
  // p5.translate(x, y);

  let shapeArray = [];

  let noiseMax = wobble;
  for (
    let a = phase;
    a < Math.PI * 2 + phase - Math.radians(gap);
    a += Math.radians(radDivisions)
  ) {
    let xoff = mapRange(Math.cos(a + phase), -1, 1, 0, noiseMax);
    let yoff = mapRange(Math.sin(a + phase), -1, 1, 0, noiseMax);

    //   simplex;
    let r = mapRange(noise3D(xoff, yoff, zoff), -1, 1, width / 4, width / 2);

    let x = r * Math.cos(a);
    let y = r * Math.sin(a);

    shapeArray.push([x, y]);

    if (prevX && prevY) {
      circumference += dist(prevX, prevY, x, y);
    }

    prevX = x;
    prevY = y;
  }

  create
    ? shapeArray.forEach((point) => {
        path.add(new Point(point[0] + width / 2, point[1] + height / 2));
      })
    : path.segments.forEach((segment, i) => {
        segment.point.x = shapeArray[i][0] + width / 2;
        segment.point.y = shapeArray[i][1] + height / 2;
      });

  path.strokeColor = "black";
  path.strokeWidth = stringWidth;
  path.closed = true;
  path.smooth({ type: "continuous" });
  // myPath.fullySelected = true;

  // if (!path.scaled) {
  if (!path.prevCircumference) {
    path.scale(desiredLength / circumference);
  } else {
    path.scale(path.prevCircumference / circumference);
  }

  path.prevCircumference = circumference;
  // path.scale(desiredLength / circumference);

  //   path.scaled = true;
  // }

  // close ? p5.endShape(p5.CLOSE) : p5.endShape();
};

// Helper functions for radians and degrees.
Math.radians = function (degrees) {
  return (degrees * Math.PI) / 180;
};

Math.degrees = function (radians) {
  return (radians * 180) / Math.PI;
};

// linearly maps value from the range (a..b) to (c..d)
function mapRange(value, a, b, c, d) {
  // first map value from (a..b) to (0..1)
  value = (value - a) / (b - a);
  // then map it from (0..1) to (c..d) and return it
  return c + value * (d - c);
}

function dist(x1, y1, x2, y2) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
