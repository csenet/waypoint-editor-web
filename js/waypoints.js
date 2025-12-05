// Waypoint Management Functions

function addWaypoint(x, y, yaw, pauseSec) {
    waypoints.push({ x, y, yaw, pauseSec });
    updateWaypointList();
    render();
}

function deleteWaypoint(index) {
    waypoints.splice(index, 1);
    updateWaypointList();
    render();
}

function clearWaypoints() {
    if (confirm('すべてのウェイポイントを削除しますか？')) {
        waypoints = [];
        updateWaypointList();
        render();
    }
}

function undoLast() {
    if (waypoints.length > 0) {
        waypoints.pop();
        updateWaypointList();
        render();
    }
}

function togglePause(index) {
    // Toggle between 0 (no pause) and -1 (wait for topic)
    waypoints[index].pauseSec = waypoints[index].pauseSec === -1 ? 0 : -1;
    updateWaypointList();
    render();
}

function updateWaypointList() {
    const list = document.getElementById('waypointList');
    document.getElementById('waypointCount').textContent = waypoints.length;

    if (waypoints.length === 0) {
        list.innerHTML = '<p style="color: #666; padding: 10px;">ウェイポイントがありません</p>';
        return;
    }

    list.innerHTML = waypoints.map((wp, i) => {
        let itemClass = '';
        let pauseLabel = '-';
        let pauseBtnClass = '';

        if (wp.pauseSec === -1) {
            itemClass = 'wait-topic';
            pauseLabel = 'W';
            pauseBtnClass = 'wait-topic';
        }

        return `
        <div class="waypoint-item ${itemClass}">
            <span class="index">${i+1}</span>
            <span class="coords">
                (${wp.x.toFixed(2)}, ${wp.y.toFixed(2)})
                ${wp.pauseSec === -1 ? '<br>トピック待機' : ''}
            </span>
            <span class="actions">
                <button class="pause-btn ${pauseBtnClass}"
                        onclick="togglePause(${i})" title="待機状態をトグル (-=なし, W=トピック待機)">
                    ${pauseLabel}
                </button>
                <button class="delete-btn" onclick="deleteWaypoint(${i})" title="削除">X</button>
            </span>
        </div>
    `}).join('');
}

function generateWaypointsFromLine(points, interval) {
    if (points.length < 2) return;

    // Calculate total length and sample at intervals
    let totalDist = 0;
    const worldPoints = points.map(p => pixelToWorld(p.x, p.y));

    for (let i = 1; i < worldPoints.length; i++) {
        const dx = worldPoints[i].x - worldPoints[i-1].x;
        const dy = worldPoints[i].y - worldPoints[i-1].y;
        totalDist += Math.sqrt(dx*dx + dy*dy);
    }

    // Add first point
    addWaypoint(worldPoints[0].x, worldPoints[0].y, 0, 0);

    // Sample along the path
    let accDist = 0;
    let lastSampleDist = 0;

    for (let i = 1; i < worldPoints.length; i++) {
        const dx = worldPoints[i].x - worldPoints[i-1].x;
        const dy = worldPoints[i].y - worldPoints[i-1].y;
        const segDist = Math.sqrt(dx*dx + dy*dy);

        let segProgress = 0;
        while (accDist + segProgress < accDist + segDist) {
            const nextSampleDist = lastSampleDist + interval;
            const distIntoSeg = nextSampleDist - accDist;

            if (distIntoSeg <= segDist) {
                const t = distIntoSeg / segDist;
                const px = worldPoints[i-1].x + dx * t;
                const py = worldPoints[i-1].y + dy * t;
                const yaw = Math.atan2(dy, dx);
                addWaypoint(px, py, yaw, 0);
                lastSampleDist = nextSampleDist;
                segProgress = distIntoSeg;
            } else {
                break;
            }
        }
        accDist += segDist;
    }

    // Calculate yaw for each waypoint based on direction to next
    for (let i = 0; i < waypoints.length - 1; i++) {
        const dx = waypoints[i+1].x - waypoints[i].x;
        const dy = waypoints[i+1].y - waypoints[i].y;
        waypoints[i].yaw = Math.atan2(dy, dx);
    }
    if (waypoints.length > 1) {
        waypoints[waypoints.length-1].yaw = waypoints[waypoints.length-2].yaw;
    }

    updateWaypointList();
}

function generateSmartPath() {
    if (!smartPathStart || !smartPathEnd || !obstacleMap) return;

    const path = findPath(smartPathStart.x, smartPathStart.y, smartPathEnd.x, smartPathEnd.y);

    if (!path) {
        alert('経路が見つかりませんでした。障害物がないか確認してください。');
        return;
    }

    // Convert pixel path to waypoints with interval sampling
    const interval = parseFloat(document.getElementById('lineInterval').value) || 0.5;
    generateWaypointsFromLine(path, interval);
}
