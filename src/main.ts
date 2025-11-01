import { assertClass, assertNonNullable } from "phil-lib/misc";
import "./style.css";
import { getById, querySelector } from "phil-lib/client-misc";

const masterCube = querySelector(".cube", HTMLDivElement);
const parent = assertNonNullable(masterCube.parentElement);
masterCube.remove();

for (let z = -5; z < 0; z++) {
  const translateZ = `${z * 6}lh`;
  for (let x = 0; x < 5; x++) {
    const translateX = `${x * 6}lh`;
    for (let y = 0; y < 5; y++) {
      const translateY = `${y * 6}lh`;
      const clone = assertClass(masterCube.cloneNode(true), HTMLDivElement);
      clone.style.transform = `translateX(${translateX}) translateY(${translateY}) translateZ(${translateZ})`;
      parent.append(clone);
    }
  }
}

const container = getById("container1", HTMLDivElement);
let current : undefined| {x:number, y:number, lastUpdate:DOMHighResTimeStamp};
let desired : undefined| {x:number, y:number};


document.addEventListener("mousemove", (event: MouseEvent) => {
  const rect = container.getBoundingClientRect();

  // Calculate the mouse position relative to the container
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Set perspective-origin to the point directly under the mouse
  container.style.perspectiveOrigin = `${x}px ${y}px`;
});

/**
 * z order is always my problem.
 * I.e. drawing one object on top of another.
 *  Right?
 * I thought I saw an example that said otherwise.
 * Stacking context?
 * The thing that says to preserve the 3d.
 * https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style
 */
