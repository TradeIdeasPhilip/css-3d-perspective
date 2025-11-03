/**
 * Create a matrix to translate from one coordinate space to another (for HTML elements).
 * @param coordinatesComeFromHere The "leaf" element (source coords).
 * @param coordinatesWillBeUsedHere The "ancestor" element (target coords).
 * @returns A matrix that transforms points from source → target space.
 */
export function rehome(
  coordinatesComeFromHere: HTMLElement,
  coordinatesWillBeUsedHere: HTMLElement
): DOMMatrix {
  const sourceCTM = getCTM(coordinatesComeFromHere);
  const targetCTM = getCTM(coordinatesWillBeUsedHere);

  return targetCTM.inverse().multiply(sourceCTM);
}

/**
 * Compute the full CTM (Cumulative Transformation Matrix) for an HTMLElement.
 * Includes all parent transforms + positioning.
 */
function getCTM(element: HTMLElement): DOMMatrix {
  const matrix = new DOMMatrix(getComputedStyle(element).transform);
  return matrix;
}

/**
 * Apply a transformation matrix to a 3D point.
 * @param x X coordinate.
 * @param y Y coordinate.
 * @param z Z coordinate (default 0 for 2D points).
 * @param matrix The transform to apply.
 * @returns The transformed point.
 */
export function transform(
  x: number,
  y: number,
  z: number = 0,
  matrix: DOMMatrix
): DOMPoint {
  return new DOMPoint(x, y, z).matrixTransform(matrix);
}

/**
 * Get the 3D axis-aligned bounding box (AABB) of a leaf element in an ancestor's coordinate system.
 * Treats the leaf as a flat 2D rectangle (depth 0) with 4 corners.
 * For full cube bounds: call this on each .side and union the results (min of mins, max of maxes).
 * @param ancestor The coordinate system to convert into (must be an ancestor of leaf).
 * @param leaf The element to measure (flat div).
 * @returns { minX, maxX, minY, maxY, minZ, maxZ } in ancestor's space.
 */
export function get3DBoundingBoxInAncestor(
  ancestor: HTMLElement,
  leaf: HTMLElement
): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
} {
  // Validate ancestry
  if (!ancestor.contains(leaf)) {
    throw new Error("Ancestor must contain the leaf element");
  }

  const rehomeMatrix = rehome(leaf, ancestor);

  // Get leaf's local 2D bounding box (relative to its own top-left corner)
  const rect = leaf.getBoundingClientRect();
  const localWidth = rect.width;
  const localHeight = rect.height;

  // Four corners in local space (Z = 0, since flat div)
  const cornersLocal = [
    { x: 0, y: 0, z: 0 },
    { x: localWidth, y: 0, z: 0 },
    { x: localWidth, y: localHeight, z: 0 },
    { x: 0, y: localHeight, z: 0 },
  ];

  // Transform all four corners
  const transformed = cornersLocal.map((p) =>
    transform(p.x, p.y, p.z, rehomeMatrix)
  );

  // Compute AABB from transformed points
  const xs = transformed.map((p) => p.x);
  const ys = transformed.map((p) => p.y);
  const zs = transformed.map((p) => p.z); // All 0 in local, but transform may add Z

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    minZ: Math.min(...zs),
    maxZ: Math.max(...zs),
  };
}
