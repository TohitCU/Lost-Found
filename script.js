const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const qs = require('querystring');
const url = require('url');

// Utility function to send an error response
function handleError(res, errorCode, message) {
    res.statusCode = errorCode;
    res.setHeader('Content-Type', 'text/html');
    res.end(`<h1>${message}</h1>`);
}

// Utility function to serve static files
async function serveFile(res, filePath, contentType = 'text/html') {
    try {
        const data = await fs.readFile(filePath);
        res.setHeader('Content-Type', contentType);
        res.statusCode = 200;
        res.end(data);
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
        handleError(res, 500, 'Internal Server Error');
    }
}

// Simple sanitization function
function sanitize(input) {
    return input.replace(/<|>/g, ''); // Remove HTML tags
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`Request method: ${req.method} | URL: ${req.url}`);

    if (req.method === 'GET') {
        // Serve static pages
        switch (pathname) {
            case '/':
                await serveFile(res, path.join(__dirname, 'home.html'));
                break;
            case '/login':
                await serveFile(res, path.join(__dirname, 'login.html'));
                break;
            case '/report':
                await serveFile(res, path.join(__dirname, 'report.html'));
                break;
            case '/search':
                await serveFile(res, path.join(__dirname, 'search.html'));
                break;
            default:
                handleError(res, 404, 'Page Not Found');
        }
    } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', async () => {
            const formData = qs.parse(body);
            for (const key in formData) {
                formData[key] = sanitize(formData[key]);
            }

            switch (pathname) {
                case '/login':
                    console.log('Login Attempt:', formData);
                    if (formData.uname === 'admin' && formData.upwd === 'admin') {
                        res.setHeader('Content-Type', 'text/html');
                        res.end('<h1 style="color:green">Login Successful</h1>');
                    } else {
                        res.setHeader('Content-Type', 'text/html');
                        res.end('<h1 style="color:red">Login Failed</h1>');
                    }
                    break;

                case '/report':
                    console.log('Report Received:', formData);
                    res.setHeader('Content-Type', 'text/html');
                    res.end('<h1 style="color:green">Report Submitted Successfully</h1>');
                    break;

                case '/search':
                    console.log('Search Query:', formData);
                    res.setHeader('Content-Type', 'text/html');
                    res.end('<h1 style="color:blue">Search Results Coming Soon!</h1>');
                    break;

                default:
                    handleError(res, 404, 'Route Not Found');
            }
        });
    } else {
        handleError(res, 405, 'Method Not Allowed');
    }
});

// Start the server on port 8081
const PORT = 8081;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
