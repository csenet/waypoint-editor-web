// File I/O Functions

function loadPGM(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);

        // Check if it's a binary PGM (P5)
        if (data[0] === 80 && data[1] === 53) { // "P5"
            parsePGM(data);
        } else {
            // Try as regular image
            const img = new Image();
            img.onload = function() {
                mapImage = img;
                imageWidth = img.width;
                imageHeight = img.height;
                buildObstacleMap();
                resetView();
            };
            img.src = URL.createObjectURL(file);
        }
    };
    reader.readAsArrayBuffer(file);
}

function parsePGM(data) {
    // Parse P5 PGM format
    let idx = 0;

    // Skip magic number "P5"
    while (data[idx] !== 10) idx++;
    idx++;

    // Skip comments
    while (data[idx] === 35) { // '#'
        while (data[idx] !== 10) idx++;
        idx++;
    }

    // Parse width and height
    let numStr = '';
    while (data[idx] !== 32 && data[idx] !== 10) {
        numStr += String.fromCharCode(data[idx]);
        idx++;
    }
    const width = parseInt(numStr);
    idx++;

    numStr = '';
    while (data[idx] !== 10) {
        numStr += String.fromCharCode(data[idx]);
        idx++;
    }
    const height = parseInt(numStr);
    idx++;

    // Parse max value
    numStr = '';
    while (data[idx] !== 10) {
        numStr += String.fromCharCode(data[idx]);
        idx++;
    }
    idx++;

    // Create image from pixel data
    const imgCanvas = document.createElement('canvas');
    imgCanvas.width = width;
    imgCanvas.height = height;
    const imgCtx = imgCanvas.getContext('2d');
    const imageData = imgCtx.createImageData(width, height);

    for (let i = 0; i < width * height; i++) {
        const val = data[idx + i];
        imageData.data[i * 4] = val;
        imageData.data[i * 4 + 1] = val;
        imageData.data[i * 4 + 2] = val;
        imageData.data[i * 4 + 3] = 255;
    }

    imgCtx.putImageData(imageData, 0, 0);

    const img = new Image();
    img.onload = function() {
        mapImage = img;
        imageWidth = width;
        imageHeight = height;
        buildObstacleMap();
        resetView();
    };
    img.src = imgCanvas.toDataURL();
}

function loadYAML(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const text = event.target.result;
        const lines = text.split('\n');

        for (const line of lines) {
            if (line.startsWith('resolution:')) {
                resolution = parseFloat(line.split(':')[1].trim());
                document.getElementById('resolution').value = resolution;
            } else if (line.startsWith('origin:')) {
                const match = line.match(/\[([^,]+),\s*([^,]+)/);
                if (match) {
                    originX = parseFloat(match[1]);
                    originY = parseFloat(match[2]);
                    document.getElementById('originX').value = originX;
                    document.getElementById('originY').value = originY;
                }
            }
        }
        render();
    };
    reader.readAsText(file);
}

function exportCSV() {
    if (waypoints.length === 0) {
        alert('エクスポートするウェイポイントがありません');
        return;
    }

    let csv = 'x,y,yaw,pause_sec\n';
    for (const wp of waypoints) {
        csv += `${wp.x.toFixed(4)},${wp.y.toFixed(4)},${wp.yaw.toFixed(4)},${wp.pauseSec}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'waypoints.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function importCSV() {
    document.getElementById('csvImport').click();
}

function handleCSVImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const lines = event.target.result.split('\n');
        waypoints = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split(',');
            if (parts.length >= 3) {
                waypoints.push({
                    x: parseFloat(parts[0]),
                    y: parseFloat(parts[1]),
                    yaw: parseFloat(parts[2]),
                    pauseSec: parts.length > 3 ? parseFloat(parts[3]) : 0
                });
            }
        }

        updateWaypointList();
        render();
    };
    reader.readAsText(file);
    e.target.value = '';
}
