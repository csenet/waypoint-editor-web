// Global State Variables

// Map and waypoint state
let mapImage = null;
let waypoints = [];
let currentMode = 'point';

// View state
let scale = 1;
let offsetX = 0;
let offsetY = 0;

// Interaction state
let isDragging = false;
let isDrawingLine = false;
let isDraggingWaypoint = false;
let isRightClickPanning = false;
let selectedWaypointIndex = -1;
let lastMouseX = 0;
let lastMouseY = 0;
let linePoints = [];

// Smart path state
let smartPathStart = null;
let smartPathEnd = null;
let obstacleMap = null;

// Double-click detection
let lastClickTime = 0;
let lastClickIndex = -1;

// Map parameters
let resolution = 0.05;
let originX = -102;
let originY = -141;
let imageWidth = 0;
let imageHeight = 0;

// Canvas elements
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvasContainer');
