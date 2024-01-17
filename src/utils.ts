export function scaleDOMRect(rect: DOMRect, scale: number, scaleCenterX: number, scaleCenterY: number): DOMRect {
    // Calculate the distance of the rect from the scale center
    const distX = rect.x - scaleCenterX;
    const distY = rect.y - scaleCenterY;

    // Scale the distances
    const newDistX = distX * scale;
    const newDistY = distY * scale;

    // Calculate the new position of the rect
    const newX = scaleCenterX + newDistX;
    const newY = scaleCenterY + newDistY;

    // Scale the dimensions of the rect
    const newWidth = rect.width * scale;
    const newHeight = rect.height * scale;

    // Create a new DOMRect with the new dimensions and position
    const newRect = new DOMRect(newX, newY, newWidth, newHeight);

    return newRect;
}