import {
  assertClass,
  assertNonNullable,
  initializedArray,
} from "phil-lib/misc";
import "./style.css";
import { getById, querySelector, querySelectorAll } from "phil-lib/client-misc";

const masterCube = querySelector(".cube", HTMLDivElement);
const parent = assertNonNullable(masterCube.parentElement);
masterCube.remove();

/**
 * x ranges from 0 to width - 1.
 */
const width = 7;

/**
 * y ranges from 0 to height - 1.
 */
const height = 5;

/**
 * z ranges from 0 to depth - 1
 */
const depth = 7;

const allCubes = initializedArray(width, () =>
  initializedArray(height, () =>
    initializedArray(depth, () => null as any as HTMLDivElement)
  )
);

const sideLength = 3;
const spaceBetween = 3;
const period = sideLength + spaceBetween;

const allTranslateZ = new Set<string>();
for (let z = 0; z < depth; z++) {
  const translateZ = `${(z - depth) * period}lh`;
  allTranslateZ.add(translateZ);
  for (let x = 0; x < width; x++) {
    const translateX = `${(x + 1) * period}lh`;
    for (let y = 0; y < height; y++) {
      const translateY = `${y * period}lh`;
      const clone = assertClass(masterCube.cloneNode(true), HTMLDivElement);
      clone.style.transform = `translateX(${translateX}) translateY(${translateY}) translateZ(${translateZ}) rotateY(var(--rotation))`;
      parent.append(clone);
      allCubes[x][y][z] = clone;
    }
  }
}
console.log([...allTranslateZ]);
// Current result: ['-48lh', '-42lh', '-36lh', '-30lh', '-24lh', '-18lh', '-12lh', '-6lh']
//    transform: ;

{
  const stageDiv = getById("stage", HTMLDivElement);
  const stageWidth = width * period - spaceBetween;
  stageDiv.style.width = `${stageWidth}lh`;
  const stageHeight = height * period - spaceBetween;
  stageDiv.style.height = `${stageHeight}lh`;
  // I don't have an exact formula for this.
  // I got this by trial and error.
  // This causes it to rotate around its center.
  const doRotate = `translateZ(-27lh) rotateY(45deg) translateZ(27lh)`;
  function updateRotateFromGUI() {
    const choice = querySelector(
      '[name="rotateStage"]:checked',
      HTMLInputElement
    ).value;
    switch (choice) {
      case "45": {
        stageDiv.style.transform = doRotate;
        break;
      }
      case "0": {
        stageDiv.style.transform = "";
        break;
      }
      default: {
        throw new Error("wtf");
      }
    }
  }
  updateRotateFromGUI();
  querySelectorAll('[name="rotateStage"]', HTMLInputElement).forEach(
    (element) => {
      element.addEventListener("input", updateRotateFromGUI);
    }
  );
}

allCubes.forEach((allOneX, x) => {
  allOneX.forEach((xAndYFixed, y) => {
    xAndYFixed.forEach((div, z) => {
      if (!div) {
        throw new Error(`Missing at (${x}, ${y}, ${z})`);
      }
    });
  });
});

(window as any).allCubes = allCubes;

allCubes.forEach((xFixed, x) => {
  xFixed.forEach((xAndYFixed, y) => {
    /**
     * All elements at the current x and y.
     * Sorted so the first one is the one closest to us.
     */
    const inOrder = xAndYFixed.toReversed();
    inOrder[0].addEventListener("click", () => {
      inOrder.forEach((cube, index) => {
        cube.getAnimations().forEach((animation) => {
          animation.cancel();
        });
        cube.animate([{ "--rotation": "0deg" }, { "--rotation": "360deg" }], {
          duration: 4000,
          easing: "cubic-bezier(0.7, -0.67, 0.33, 1.66)",
          delay: 1500 * index,
        });
      });
    });
  });
});

const container = getById("container1", HTMLDivElement);

document.addEventListener("mousemove", (event: MouseEvent) => {
  const rect = container.getBoundingClientRect();

  // Calculate the mouse position relative to the container
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  container.style.perspectiveOrigin = `${x}px ${y}px`;
});
