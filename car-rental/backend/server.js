// 🚗 CAR RENTAL BACKEND - SIMPLE VERSION
console.log("Starting Car Rental Server...");

const http = require("http");

// Car data
const cars = [
    {
        id: 1,
        name: "Economy Class",
        price: 29,
        seats: 4,
        bags: 2,
        category: "Popular"
    },
    {
        id: 2,
        name: "Sedan Class",
        price: 49,
        seats: 5,
        bags: 3,
        category: "Recommended"
    },
    {
        id: 3,
        name: "Luxury SUV",
        price: 89,
        seats: 7,
        bags: 5,
        category: "Premium"
    }
];

// Create server
const server = http.createServer((req, res) => {
    // Allow all origins (CORS)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    
    console.log(`Request: ${req.method} ${req.url}`);
    
    // Handle OPTIONS (CORS preflight)
    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Routes
    if (req.url === "/" || req.url === "/api") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
            message: "Car Rental API",
            version: "1.0.0",
            endpoints: [
                "GET /api/cars - Get all cars",
                "POST /api/bookings - Create booking"
            ]
        }));
    }
    else if (req.url === "/api/cars" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(cars));
    }
    else if (req.url === "/api/bookings" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            try {
                const data = JSON.parse(body);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    success: true,
                    message: "Booking confirmed!",
                    bookingId: Date.now(),
                    customer: data.firstName || "Customer",
                    timestamp: new Date().toLocaleString()
                }));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Invalid data" }));
            }
        });
    }
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
    }
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log("=================================");
    console.log("✅ SERVER IS RUNNING!");
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log("📡 Endpoints:");
    console.log(`   • http://localhost:${PORT}/`);
    console.log(`   • http://localhost:${PORT}/api/cars`);
    console.log("=================================");
});