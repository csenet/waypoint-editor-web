// A* Pathfinding with Obstacle Avoidance

// Safety margin from obstacles (in pixels)
const SAFETY_MARGIN = 3;

// Build obstacle map from image with safety margin
function buildObstacleMap() {
    if (!mapImage) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageWidth;
    tempCanvas.height = imageHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(mapImage, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, imageWidth, imageHeight);
    const data = imageData.data;

    // First pass: detect obstacles
    const rawObstacles = new Array(imageHeight);
    for (let y = 0; y < imageHeight; y++) {
        rawObstacles[y] = new Array(imageWidth);
        for (let x = 0; x < imageWidth; x++) {
            const idx = (y * imageWidth + x) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            // Threshold: darker pixels are obstacles
            rawObstacles[y][x] = brightness < 128 ? 1 : 0;
        }
    }

    // Second pass: apply safety margin (dilate obstacles)
    obstacleMap = new Array(imageHeight);
    for (let y = 0; y < imageHeight; y++) {
        obstacleMap[y] = new Array(imageWidth);
        for (let x = 0; x < imageWidth; x++) {
            // Check if any obstacle exists within SAFETY_MARGIN
            let hasObstacleNearby = false;
            for (let dy = -SAFETY_MARGIN; dy <= SAFETY_MARGIN; dy++) {
                for (let dx = -SAFETY_MARGIN; dx <= SAFETY_MARGIN; dx++) {
                    const ny = y + dy;
                    const nx = x + dx;
                    if (ny >= 0 && ny < imageHeight && nx >= 0 && nx < imageWidth) {
                        if (rawObstacles[ny][nx] === 1) {
                            hasObstacleNearby = true;
                            break;
                        }
                    }
                }
                if (hasObstacleNearby) break;
            }
            obstacleMap[y][x] = hasObstacleNearby ? 1 : 0;
        }
    }
}

// A* pathfinding algorithm
function findPath(startPx, startPy, endPx, endPy) {
    if (!obstacleMap) return null;

    const start = { x: Math.round(startPx), y: Math.round(startPy) };
    const end = { x: Math.round(endPx), y: Math.round(endPy) };

    // Check bounds
    if (start.x < 0 || start.x >= imageWidth || start.y < 0 || start.y >= imageHeight) return null;
    if (end.x < 0 || end.x >= imageWidth || end.y < 0 || end.y >= imageHeight) return null;

    const openSet = [start];
    const cameFrom = {};
    const gScore = {};
    const fScore = {};
    const key = (p) => `${p.x},${p.y}`;

    gScore[key(start)] = 0;
    fScore[key(start)] = heuristic(start, end);

    while (openSet.length > 0) {
        // Find node with lowest fScore
        let current = openSet[0];
        let currentIdx = 0;
        for (let i = 1; i < openSet.length; i++) {
            if (fScore[key(openSet[i])] < fScore[key(current)]) {
                current = openSet[i];
                currentIdx = i;
            }
        }

        // Reached goal
        if (current.x === end.x && current.y === end.y) {
            return reconstructPath(cameFrom, current);
        }

        openSet.splice(currentIdx, 1);

        // Check neighbors
        const neighbors = [
            { x: current.x - 1, y: current.y },
            { x: current.x + 1, y: current.y },
            { x: current.x, y: current.y - 1 },
            { x: current.x, y: current.y + 1 },
            { x: current.x - 1, y: current.y - 1 },
            { x: current.x + 1, y: current.y - 1 },
            { x: current.x - 1, y: current.y + 1 },
            { x: current.x + 1, y: current.y + 1 }
        ];

        for (const neighbor of neighbors) {
            // Check bounds and obstacles
            if (neighbor.x < 0 || neighbor.x >= imageWidth ||
                neighbor.y < 0 || neighbor.y >= imageHeight ||
                obstacleMap[neighbor.y][neighbor.x] === 1) {
                continue;
            }

            const isDiagonal = neighbor.x !== current.x && neighbor.y !== current.y;
            const tentativeGScore = gScore[key(current)] + (isDiagonal ? 1.414 : 1);

            if (!(key(neighbor) in gScore) || tentativeGScore < gScore[key(neighbor)]) {
                cameFrom[key(neighbor)] = current;
                gScore[key(neighbor)] = tentativeGScore;
                fScore[key(neighbor)] = gScore[key(neighbor)] + heuristic(neighbor, end);

                if (!openSet.some(p => p.x === neighbor.x && p.y === neighbor.y)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    return null; // No path found
}

function heuristic(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function reconstructPath(cameFrom, current) {
    const path = [current];
    const key = (p) => `${p.x},${p.y}`;

    while (key(current) in cameFrom) {
        current = cameFrom[key(current)];
        path.unshift(current);
    }

    return path;
}
