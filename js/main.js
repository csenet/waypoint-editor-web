// Main Initialization and Mode Control

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-buttons .btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('mode' + mode.charAt(0).toUpperCase() + mode.slice(1)).classList.add('active');

    if (mode === 'pan') {
        canvas.style.cursor = 'grab';
    } else if (mode === 'select') {
        canvas.style.cursor = 'pointer';
    } else {
        canvas.style.cursor = 'crosshair';
    }

    // Clear selection when changing mode
    if (mode !== 'select') {
        selectedWaypointIndex = -1;
    }

    // Clear smart path selection
    if (mode !== 'smartPath') {
        smartPathStart = null;
        smartPathEnd = null;
    }

    render();
}

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    canvas.addEventListener('wheel', onWheel);

    // Add keyboard event listener for Delete key
    document.addEventListener('keydown', onKeyDown);

    document.getElementById('resolution').addEventListener('change', updateResolution);
    document.getElementById('originX').addEventListener('change', updateOrigin);
    document.getElementById('originY').addEventListener('change', updateOrigin);
    document.getElementById('pgmFile').addEventListener('change', loadPGM);
    document.getElementById('yamlFile').addEventListener('change', loadYAML);
    document.getElementById('csvImport').addEventListener('change', handleCSVImport);

    render();
}

// Initialize on load
init();
