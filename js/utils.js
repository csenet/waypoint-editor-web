// Coordinate Transformation Functions

function pixelToWorld(px, py) {
    // PGM origin is top-left, ROS map origin is bottom-left
    const worldX = originX + px * resolution;
    const worldY = originY + (imageHeight - py) * resolution;
    return { x: worldX, y: worldY };
}

function worldToPixel(wx, wy) {
    const px = (wx - originX) / resolution;
    const py = imageHeight - (wy - originY) / resolution;
    return { x: px, y: py };
}

function screenToPixel(sx, sy) {
    return {
        x: (sx - offsetX) / scale,
        y: (sy - offsetY) / scale
    };
}

function pixelToScreen(px, py) {
    return {
        x: px * scale + offsetX,
        y: py * scale + offsetY
    };
}

// Find waypoint at screen position (returns index or -1)
function findWaypointAtPosition(sx, sy) {
    const clickRadius = 15; // pixels

    for (let i = waypoints.length - 1; i >= 0; i--) {
        const wp = waypoints[i];
        const pixel = worldToPixel(wp.x, wp.y);
        const screen = pixelToScreen(pixel.x, pixel.y);

        const dx = screen.x - sx;
        const dy = screen.y - sy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= clickRadius) {
            return i;
        }
    }
    return -1;
}

// Update parameters from input fields
function updateResolution() {
    resolution = parseFloat(document.getElementById('resolution').value) || 0.05;
    render();
}

function updateOrigin() {
    originX = parseFloat(document.getElementById('originX').value) || 0;
    originY = parseFloat(document.getElementById('originY').value) || 0;
    render();
}
