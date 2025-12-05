// Rendering Functions

function render() {
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mapImage) {
        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
        ctx.drawImage(mapImage, 0, 0);
        ctx.restore();
    }

    // Draw grid
    if (scale > 0.5) {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        const gridSize = 1 / resolution; // 1 meter in pixels
        const scaledGrid = gridSize * scale;

        if (scaledGrid > 20) {
            const startX = offsetX % scaledGrid;
            const startY = offsetY % scaledGrid;

            ctx.beginPath();
            for (let x = startX; x < canvas.width; x += scaledGrid) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
            }
            for (let y = startY; y < canvas.height; y += scaledGrid) {
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
            }
            ctx.stroke();
        }
    }

    // Draw waypoints
    for (let i = 0; i < waypoints.length; i++) {
        const wp = waypoints[i];
        const pixel = worldToPixel(wp.x, wp.y);
        const screen = pixelToScreen(pixel.x, pixel.y);

        // Draw connection line to next waypoint
        if (i < waypoints.length - 1) {
            const nextWp = waypoints[i + 1];
            const nextPixel = worldToPixel(nextWp.x, nextWp.y);
            const nextScreen = pixelToScreen(nextPixel.x, nextPixel.y);

            ctx.strokeStyle = '#4caf50';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(screen.x, screen.y);
            ctx.lineTo(nextScreen.x, nextScreen.y);
            ctx.stroke();
        }

        // Draw waypoint marker
        let radius = 6;
        let markerColor = '#e94560';
        if (wp.pauseSec === -1) {
            radius = 10;
            markerColor = '#00bcd4';
        } else if (wp.pauseSec > 0) {
            radius = 10;
            markerColor = '#ffa500';
        }

        // Draw selection indicator
        if (i === selectedWaypointIndex) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, radius + 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = markerColor;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw orientation arrow
        const arrowLen = 15;
        const arrowX = screen.x + Math.cos(-wp.yaw) * arrowLen;
        const arrowY = screen.y + Math.sin(-wp.yaw) * arrowLen;

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screen.x, screen.y);
        ctx.lineTo(arrowX, arrowY);
        ctx.stroke();

        // Draw index number
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.fillText(i + 1, screen.x + 10, screen.y - 5);

        // Draw pause indicator
        if (wp.pauseSec === -1) {
            ctx.fillStyle = '#00bcd4';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText('WAIT', screen.x + 10, screen.y + 15);
        } else if (wp.pauseSec > 0) {
            ctx.fillStyle = '#ffa500';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText(`${wp.pauseSec}s`, screen.x + 10, screen.y + 15);
        }
    }

    // Draw smart path markers
    if (currentMode === 'smartPath' && smartPathStart) {
        const screen = pixelToScreen(smartPathStart.x, smartPathStart.y);
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('開始', screen.x + 12, screen.y + 5);
    }

    // Draw origin marker
    if (mapImage) {
        const originScreen = pixelToScreen(0, imageHeight);
        ctx.strokeStyle = '#00f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(originScreen.x - 10, originScreen.y);
        ctx.lineTo(originScreen.x + 20, originScreen.y);
        ctx.moveTo(originScreen.x, originScreen.y + 10);
        ctx.lineTo(originScreen.x, originScreen.y - 20);
        ctx.stroke();

        ctx.fillStyle = '#00f';
        ctx.font = '12px sans-serif';
        ctx.fillText('原点', originScreen.x + 5, originScreen.y + 20);
    }
}

function resizeCanvas() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    render();
}
