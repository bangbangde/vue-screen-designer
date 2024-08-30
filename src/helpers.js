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

export function calculateInitialZoomLevel(containerHeight, boardHeight) {
  const initialPadding = 85;
  let zoom = Math.round((containerHeight - initialPadding * 2) / boardHeight * 100);
  if (zoom < 10) {
    zoom = 10;
  } else if (zoom > 200) {
    zoom = 200;
  }
  return zoom;
}

