import { assertClass, assertNonNullable } from "phil-lib/misc";
import "./style.css";
import { AnimationLoop, getById, querySelector } from "phil-lib/client-misc";

const masterCube = querySelector(".cube", HTMLDivElement);
const parent = assertNonNullable(masterCube.parentElement);
masterCube.remove();

for (let z = -7; z < 0; z++) {
  const translateZ = `${z * 6}lh`;
  for (let x = 0; x < 7; x++) {
    const translateX = `${x * 6}lh`;
    for (let y = 0; y < 7; y++) {
      const translateY = `${y * 6}lh`;
      const clone = assertClass(masterCube.cloneNode(true), HTMLDivElement);
      clone.style.transform = `translateX(${translateX}) translateY(${translateY}) translateZ(${translateZ})`;
      parent.append(clone);
    }
  }
}

const container = getById("container1", HTMLDivElement);
let current:
  | undefined
  | { x: number; y: number; lastUpdate: DOMHighResTimeStamp };
let desired: undefined | { x: number; y: number };

document.addEventListener("mousemove", (event: MouseEvent) => {
  const rect = container.getBoundingClientRect();

  // Calculate the mouse position relative to the container
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  desired = { x, y };
});

const animationLoop = new AnimationLoop((time) => {
  const halfLife = 150;
  if (desired) {
    if (current) {
      const timePassed = time - current.lastUpdate;
      const decayFactor = Math.pow(0.5, timePassed / halfLife);
      current.x = desired.x + (current.x - desired.x) * decayFactor;
      current.y = desired.y + (current.y - desired.y) * decayFactor;
      current.lastUpdate = time;
    } else {
      current = { ...desired, lastUpdate: time };
    }
    container.style.perspectiveOrigin = `${current.x}px ${current.y}px`;
  }
});
(window as any).animationLoop = animationLoop;

/**
 * z order is always my problem.
 * I.e. drawing one object on top of another.
 *  Right?
 * I thought I saw an example that said otherwise.
 * Stacking context?
 * The thing that says to preserve the 3d.
 * https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style
 */
