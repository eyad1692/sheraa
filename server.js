const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
    // 1. Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 2. Handle POST /api/book
    if (req.method === 'POST' && req.url === '/api/book') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { name, phone, service, message } = data;

                if (!name || !phone) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'يرجى إدخال الاسم ورقم الهاتف' }));
                    return;
                }

                const bookingData = {
                    id: Date.now(),
                    name,
                    phone,
                    service,
                    message,
                    timestamp: new Date().toISOString()
                };

                const filePath = path.join(ROOT_DIR, 'bookings.json');
                let bookings = [];
                if (fs.existsSync(filePath)) {
                    bookings = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                }
                bookings.push(bookingData);
                fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2));

                console.log('New Booking received:', bookingData);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'تم استلام طلبك بنجاح، سنتصل بك قريباً!' }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'خطأ في معالجة البيانات' }));
            }
        });
        return;
    }

    // 3. Handle Static File Serving
    let filePath = path.join(ROOT_DIR, req.url === '/' ? 'index.html' : req.url);
    
    // If opening 'test' directly without extension
    if (!path.extname(filePath) && fs.existsSync(filePath)) {
        // Fallback or handle specifically if needed
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Vanilla Node.js Server running on port ${PORT}`);
    console.log(`Access at http://localhost:${PORT}`);
});
