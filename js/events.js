// Event Handlers

function onMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    lastMouseX = sx;
    lastMouseY = sy;

    // Right click (button 2) for panning
    if (e.button === 2) {
        isRightClickPanning = true;
        canvas.style.cursor = 'grabbing';
        return;
    }

    if (currentMode === 'pan') {
        isDragging = true;
        canvas.style.cursor = 'grabbing';
    } else if (currentMode === 'select') {
        const wpIndex = findWaypointAtPosition(sx, sy);
        if (wpIndex !== -1) {
            // Check for double-click
            const currentTime = Date.now();
            if (wpIndex === lastClickIndex && currentTime - lastClickTime < 300) {
                // Double-click detected - toggle wait state
                togglePause(wpIndex);
                lastClickTime = 0;
                lastClickIndex = -1;
            } else {
                // Single click - select and prepare to drag
                selectedWaypointIndex = wpIndex;
                isDraggingWaypoint = true;
                canvas.style.cursor = 'move';
                lastClickTime = currentTime;
                lastClickIndex = wpIndex;
            }
            render();
        } else {
            selectedWaypointIndex = -1;
            lastClickTime = 0;
            lastClickIndex = -1;
            render();
        }
    } else if (currentMode === 'point') {
        const pixel = screenToPixel(sx, sy);
        if (mapImage && pixel.x >= 0 && pixel.x < imageWidth && pixel.y >= 0 && pixel.y < imageHeight) {
            const world = pixelToWorld(pixel.x, pixel.y);
            addWaypoint(world.x, world.y, 0, 0);
        }
    } else if (currentMode === 'line') {
        isDrawingLine = true;
        linePoints = [];
        const pixel = screenToPixel(sx, sy);
        if (mapImage) {
            linePoints.push(pixel);
        }
    } else if (currentMode === 'smartPath') {
        const pixel = screenToPixel(sx, sy);
        if (mapImage && pixel.x >= 0 && pixel.x < imageWidth && pixel.y >= 0 && pixel.y < imageHeight) {
            if (!smartPathStart) {
                smartPathStart = pixel;
                render();
            } else {
                smartPathEnd = pixel;
                generateSmartPath();
                smartPathStart = null;
                smartPathEnd = null;
                render();
            }
        }
    }
}

function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    // Update status bar
    const pixel = screenToPixel(sx, sy);
    document.getElementById('mouseCoords').textContent = `Pixel: (${pixel.x.toFixed(0)}, ${pixel.y.toFixed(0)})`;

    if (mapImage && pixel.x >= 0 && pixel.x < imageWidth && pixel.y >= 0 && pixel.y < imageHeight) {
        const world = pixelToWorld(pixel.x, pixel.y);
        document.getElementById('worldCoords').textContent = `World: (${world.x.toFixed(2)}, ${world.y.toFixed(2)}) m`;
    }

    if (isDraggingWaypoint && selectedWaypointIndex !== -1) {
        const pixel = screenToPixel(sx, sy);
        if (mapImage && pixel.x >= 0 && pixel.x < imageWidth && pixel.y >= 0 && pixel.y < imageHeight) {
            const world = pixelToWorld(pixel.x, pixel.y);
            waypoints[selectedWaypointIndex].x = world.x;
            waypoints[selectedWaypointIndex].y = world.y;
            updateWaypointList();
            render();
        }
    } else if (isDragging || isRightClickPanning) {
        offsetX += sx - lastMouseX;
        offsetY += sy - lastMouseY;
        lastMouseX = sx;
        lastMouseY = sy;
        render();
    } else if (isDrawingLine) {
        const pixel = screenToPixel(sx, sy);
        linePoints.push(pixel);
        render();

        // Draw temporary line
        ctx.strokeStyle = '#ff0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < linePoints.length; i++) {
            const sp = pixelToScreen(linePoints[i].x, linePoints[i].y);
            if (i === 0) ctx.moveTo(sp.x, sp.y);
            else ctx.lineTo(sp.x, sp.y);
        }
        ctx.stroke();
    } else if (currentMode === 'select') {
        // Update cursor based on whether hovering over a waypoint
        const wpIndex = findWaypointAtPosition(sx, sy);
        canvas.style.cursor = wpIndex !== -1 ? 'pointer' : 'default';
    }
}

function onMouseUp() {
    if (isDraggingWaypoint) {
        isDraggingWaypoint = false;
        canvas.style.cursor = 'pointer';
    }

    if (isDragging) {
        isDragging = false;
        canvas.style.cursor = currentMode === 'pan' ? 'grab' : 'crosshair';
    }

    if (isRightClickPanning) {
        isRightClickPanning = false;
        // Restore cursor based on current mode
        if (currentMode === 'pan') {
            canvas.style.cursor = 'grab';
        } else if (currentMode === 'select') {
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = 'crosshair';
        }
    }

    if (isDrawingLine && linePoints.length > 1) {
        const interval = parseFloat(document.getElementById('lineInterval').value) || 0.5;
        generateWaypointsFromLine(linePoints, interval);
    }
    isDrawingLine = false;
    linePoints = [];
    render();
}

function onWheel(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const oldScale = scale;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    scale *= delta;
    scale = Math.max(0.1, Math.min(10, scale));

    // Zoom towards cursor
    offsetX = sx - (sx - offsetX) * (scale / oldScale);
    offsetY = sy - (sy - offsetY) * (scale / oldScale);

    document.getElementById('zoomLevel').textContent = `Zoom: ${(scale * 100).toFixed(0)}%`;
    render();
}

function onKeyDown(e) {
    // Mode switching with number keys (1-5)
    // Only if not typing in an input field
    if (!e.target.matches('input, textarea')) {
        if (e.key === '1') {
            e.preventDefault();
            setMode('point');
            return;
        } else if (e.key === '2') {
            e.preventDefault();
            setMode('line');
            return;
        } else if (e.key === '3') {
            e.preventDefault();
            setMode('smartPath');
            return;
        } else if (e.key === '4') {
            e.preventDefault();
            setMode('select');
            return;
        } else if (e.key === '5') {
            e.preventDefault();
            setMode('pan');
            return;
        }
    }

    // Delete or Backspace key - delete selected waypoint
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedWaypointIndex !== -1) {
        e.preventDefault();
        deleteWaypoint(selectedWaypointIndex);
        selectedWaypointIndex = -1;
    }
    // W key - toggle wait state for selected waypoint
    else if ((e.key === 'w' || e.key === 'W') && selectedWaypointIndex !== -1 && !e.target.matches('input, textarea')) {
        e.preventDefault();
        togglePause(selectedWaypointIndex);
    }
}

function zoomIn() {
    scale *= 1.2;
    scale = Math.min(10, scale);
    document.getElementById('zoomLevel').textContent = `Zoom: ${(scale * 100).toFixed(0)}%`;
    render();
}

function zoomOut() {
    scale *= 0.8;
    scale = Math.max(0.1, scale);
    document.getElementById('zoomLevel').textContent = `Zoom: ${(scale * 100).toFixed(0)}%`;
    render();
}

function resetView() {
    if (mapImage) {
        const scaleX = canvas.width / imageWidth;
        const scaleY = canvas.height / imageHeight;
        scale = Math.min(scaleX, scaleY) * 0.9;
        offsetX = (canvas.width - imageWidth * scale) / 2;
        offsetY = (canvas.height - imageHeight * scale) / 2;
    } else {
        scale = 1;
        offsetX = 0;
        offsetY = 0;
    }
    document.getElementById('zoomLevel').textContent = `Zoom: ${(scale * 100).toFixed(0)}%`;
    render();
}
