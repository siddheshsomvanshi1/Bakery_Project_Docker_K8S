const http = require('http');

let products = [
    {id: 1, name: "Cake", price: 49.99, image: "img/product-1.jpg", quantity: 10},
    {id: 2, name: "Bread", price: 14.99, image: "img/product-2.jpg", quantity: 20},
    {id: 3, name: "Cookies", price: 24.49, image: "img/product-3.jpg", quantity: 30},
    {id: 4, name: "Pastry", price: 15.00, image: "img/product-1.jpg", quantity: 15},
    {id: 5, name: "Donuts", price: 10.00, image: "img/product-2.jpg", quantity: 25},
    {id: 6, name: "Croissants", price: 12.00, image: "img/product-3.jpg", quantity: 12}
];

let orders = [];

const server = http.createServer((req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        const url = req.url;
        const method = req.method;
        console.log(`${method} ${url}`); // Added logging
        res.setHeader('Content-Type', 'application/json');

        try {
            // Products
            if (url === '/api/products' && method === 'GET') {
                res.end(JSON.stringify(products));
            } 
            else if (url === '/api/admin/products' && method === 'GET') {
                res.end(JSON.stringify(products));
            }
            else if (url === '/api/admin/products' && method === 'POST') {
                const p = JSON.parse(body);
                p.id = products.length > 0 ? Math.max(...products.map(i => i.id)) + 1 : 1;
                products.push(p);
                res.end(JSON.stringify({status: 'ok', message: 'Product added'}));
            }
            else if (url === '/api/admin/products' && method === 'PUT') {
                const p = JSON.parse(body);
                const index = products.findIndex(i => i.id == p.id);
                if (index !== -1) products[index] = p;
                res.end(JSON.stringify({status: 'ok', message: 'Product updated'}));
            }
            else if (url === '/api/admin/products' && method === 'DELETE') {
                const p = JSON.parse(body);
                products = products.filter(i => i.id != p.id);
                res.end(JSON.stringify({status: 'ok', message: 'Product deleted'}));
            }
            
            // Auth
            else if (url === '/api/admin/login' && method === 'POST') {
                const { username, password } = JSON.parse(body);
                if (username === 'admin' && password === 'admin123') {
                    res.end(JSON.stringify({status: 'ok', message: 'Login successful'}));
                } else {
                    res.end(JSON.stringify({status: 'error', message: 'Invalid credentials'}));
                }
            }
            else if (url === '/api/employee/login' && method === 'POST') {
                console.log(`Login request body: ${body}`);
                try {
                    const { username, password } = JSON.parse(body);
                    console.log(`Employee login attempt: ${username}`);
                    if (username === 'emp' && password === 'emp123') {
                        console.log('Employee login successful');
                        res.end(JSON.stringify({status: 'ok', message: 'Login successful'}));
                    } else {
                        console.log('Employee login failed: Invalid credentials');
                        res.end(JSON.stringify({status: 'error', message: 'Invalid credentials'}));
                    }
                } catch (parseError) {
                    console.error('Error parsing login body:', parseError);
                    res.end(JSON.stringify({status: 'error', message: 'Invalid request format'}));
                }
            }

            // Orders
            else if (url === '/api/orders' && method === 'POST') {
                const order = JSON.parse(body);
                order.id = orders.length + 1;
                order.status = 'Pending';
                order.message = '';
                order.name = order.customer_name;
                order.email = order.customer_email;
                order.address = order.address || 'Not provided';
                
                // Calculate total cost if not provided by client
                if (!order.total_cost) {
                    order.total_cost = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                }
                
                orders.push(order);
                res.end(JSON.stringify({status: 'ok', message: 'Order placed successfully'}));
            }
            else if (url === '/api/admin/orders' && method === 'GET') {
                res.end(JSON.stringify(orders));
            }
            else if (url === '/api/admin/orders' && method === 'PUT') {
                const { id, status, message } = JSON.parse(body);
                const index = orders.findIndex(o => o.id == id);
                if (index !== -1) {
                    orders[index].status = status;
                    orders[index].message = message;
                }
                res.end(JSON.stringify({status: 'ok', message: 'Order updated'}));
            }

            // Other
            else if (url === '/api/team' && method === 'GET') {
                res.end(JSON.stringify([
                    {id:1,name:"ganesh jadhav",role:"Master Chef",image:"img/team-1.jpg"},
                    {id:2,name:"akshay malviya",role:"Bakery Specialist",image:"img/team-2.jpg"},
                    {id:3,name:"krushna kharat",role:"Cake Decorator",image:"img/team-3.jpg"},
                    {id:4,name:"rushikesh yadhav",role:"Pastry Expert",image:"img/team-4.jpg"}
                ]));
            }
            else if (url === '/api/testimonials' && method === 'GET') {
                res.end(JSON.stringify([
                    {id:1,name:"John",text:"Best bakery in town"},
                    {id:2,name:"Emma",text:"Amazing croissants"},
                    {id:3,name:"Liam",text:"Great service and coffee"}
                ]));
            }
            else {
                res.writeHead(404);
                res.end(JSON.stringify({error: 'not found'}));
            }
        } catch (e) {
            res.writeHead(500);
            res.end(JSON.stringify({error: e.message}));
        }
    });
});

const PORT = 8080;
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => {
    console.log(`Mock Backend Server running at http://${HOST}:${PORT}/`);
});
