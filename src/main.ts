import { assertClass, assertNonNullable } from "phil-lib/misc";
import "./style.css";
import { AnimationLoop, getById, querySelector } from "phil-lib/client-misc";

const masterCube = querySelector(".cube", HTMLDivElement);
const parent = assertNonNullable(masterCube.parentElement);
masterCube.remove();

for (let z = -5; z < 0; z++) {
  const translateZ = `${z * 6}lh`;
  for (let x = 0; x < 9; x++) {
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

document.addEventListener("mousemove", (event: MouseEvent) => {
  const rect = container.getBoundingClientRect();

  // Calculate the mouse position relative to the container
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  container.style.perspectiveOrigin = `${x}px ${y}px`;
});
