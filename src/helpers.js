export function getAncestorWithClass(element, className, topClassName) {
  let parent = element.parentElement;

  while (parent) {
    if (parent.classList.contains(className)) {
      return parent;
    }
    if (topClassName && parent.classList.contains(topClassName)) {
      return null;
    }
    parent = parent.parentElement;
  }

  return null;
}

export function calculateInitialZoomLevel(containerSize, screenSize) {
  const initialPadding = 85;
  let zoom = Math.min(
      Math.round((containerSize[0] - initialPadding * 2) / screenSize[0] * 100),
      Math.round((containerSize[1] - initialPadding * 2) / screenSize[1] * 100)
  );
  if (zoom < 10) {
    zoom = 10;
  } else if (zoom > 200) {
    zoom = 200;
  }
  return zoom;
}

