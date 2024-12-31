<?php
/*
    First, I'm including some headers that allow my PHP script to receive
    requests from anywhere from my react port 3000(CORS) and handle different HTTP methods.
*/
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// If the request is OPTIONS (like a pre-flight request), I'll just return 200 and stop.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/*
    Now I'm setting up the database configuration. I'm using local credentials
    (root / no password), and I'm naming the database 'users'. This can be changed
    if you want a different setup.
*/
$db_host = 'localhost';  
$db_username = 'root';   
$db_password = '';       
$db_name = 'users';

/*
    Step 1: Connect to the MySQL server WITHOUT selecting a database yet.
    If it fails, I respond with an error message in JSON.
*/
$conn = new mysqli($db_host, $db_username, $db_password);
if ($conn->connect_error) {
    die(json_encode(['error' => "Database connection failed: {$conn->connect_error}"]));
}

/*
    Step 2: Create the database if it doesn't already exist.
    If that fails, return an error.
*/
$dbCreateQuery = "CREATE DATABASE IF NOT EXISTS `$db_name`";
if (!$conn->query($dbCreateQuery)) {
    die(json_encode(['error' => "Database creation failed: {$conn->error}"]));
}

/*
    Step 3: Now that I'm sure the database exists, I select it (USE it).
    If that fails, return an error.
*/
if (!$conn->select_db($db_name)) {
    die(json_encode(['error' => "Failed to select database: {$conn->error}"]));
}

/*
    Next, I create the tables if they don't exist:
    - A 'users' table for normal user info
    - An 'admins' table for admin info
    - A 'catalog' table for product items
    - An 'orders' table to store order data
*/

// 1) USERS TABLE
$conn->query("
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(15) NOT NULL
    )
");

// 2) ADMINS TABLE
$conn->query("
    CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    )
");

// I'm ensuring a default admin user exists so I can test admin login immediately.
$admin_email = 'admin@example.com';
$admin_password = password_hash('adminpassword', PASSWORD_DEFAULT);
$conn->query("
    INSERT IGNORE INTO admins (name, email, password)
    VALUES ('Admin', '$admin_email', '$admin_password')
");

// I'm also inserting a test user so I can log in as a normal user without manual setup.
$test_email = 'test@example.com';
$test_password = password_hash('testpassword', PASSWORD_DEFAULT);
$conn->query("
    INSERT IGNORE INTO users (name, email, password, phone)
    VALUES ('TestUser', '$test_email', '$test_password', '123456789')
");

// 3) CATALOG TABLE (contains items for sale).
$conn->query("
    CREATE TABLE IF NOT EXISTS catalog (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255),
        price DECIMAL(10,2),
        image_url VARCHAR(255) DEFAULT '',
        alt_text VARCHAR(255) DEFAULT ''
    )
");

// 4) ORDERS TABLE (stores orders with a JSON field for order data).
$conn->query("
    CREATE TABLE IF NOT EXISTS orders (
        order_id INT AUTO_INCREMENT PRIMARY KEY,
        order_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
");

/*
    These two helper functions let me:
    1) Send JSON responses with a given HTTP status (respond)
    2) Verify a password using PHP's password_verify (verify_password)
*/
function respond($status, $body = []) {
    http_response_code($status);
    echo json_encode($body);
    exit;
}

function verify_password($password, $hash) {
    return password_verify($password, $hash);
}

/*
    Here I'm parsing the incoming request:
    - $request_uri is the path (like /api.php/register)
    - $request_method is GET, POST, PUT, etc.
    - $data is the JSON body if there is one.
*/
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true) ?? [];

/*
    I use a switch statement to handle each route + HTTP method combination.
    For example: '/api.php/register:POST' means "POST request to /api.php/register".
*/
switch ("$request_uri:$request_method") {

    // ========== USER REGISTRATION ==========
    case '/api.php/register:POST':
        /*
            I'm grabbing the name, email, password, and phone from $data.
            Then I check if the email is valid. If it's not, I respond with a 400 error.
            If it is, I hash the password and insert a new user. Then I generate a token
            (just a random string) to send back. 
        */
        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $phone = $data['phone'] ?? '';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            respond(400, ['error' => 'Invalid email']);
        }

        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)");
        $stmt->bind_param('ssss', $name, $email, $hashed_password, $phone);

        if (!$stmt->execute()) {
            respond(500, ['error' => 'Registration failed. Possibly duplicate email.']);
        }

        // Generate a random token to simulate a login token
        $token = bin2hex(random_bytes(16));
        respond(201, ['token' => $token]);
        break;

    // ========== USER LOGIN ==========
    case '/api.php/login:POST':
        /*
            For user login, I'm reading the email and password from the request body.
            Then I check the database for a user that matches the email.
            If the user doesn't exist or the password doesn't match (using verify_password),
            I return a 401 error. Otherwise, I generate a token and return it
            (along with the user's name and email).
        */
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();

        if (!$user || !verify_password($password, $user['password'])) {
            respond(401, ['error' => 'Invalid credentials']);
        }

        $token = bin2hex(random_bytes(16));
        respond(200, [
            'token' => $token,
            'user'  => [
                'name'  => $user['name'],
                'email' => $user['email']
            ]
        ]);
        break;

    // ========== ADMIN LOGIN ==========
    case '/api.php/admin-login:POST':
        /*
            Similar to user login, but I'm checking the 'admins' table instead.
            If the admin is found and the password is correct, I return a token,
            plus 'isAdmin' set to true.
        */
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $stmt = $conn->prepare("SELECT * FROM admins WHERE email = ?");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $admin = $stmt->get_result()->fetch_assoc();

        if (!$admin || !verify_password($password, $admin['password'])) {
            respond(401, ['error' => 'Invalid credentials']);
        }

        $token = bin2hex(random_bytes(16));
        respond(200, [
            'token'   => $token,
            'user'    => [
                'name'  => $admin['name'],
                'email' => $admin['email']
            ],
            'isAdmin' => true
        ]);
        break;

    // ========== GET ALL CATALOG ITEMS ==========
    case '/api.php/catalog:GET':
        /*
            If the route is /api.php/catalog with GET, I query all items from the 'catalog'
            table and return them as an array of objects in JSON.
        */
        $result = $conn->query("SELECT * FROM catalog");
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        respond(200, $items);
        break;

    // ========== CREATE NEW CATALOG ITEM ==========
    case '/api.php/catalog:POST':
        /*
            For creating a new catalog item, I read the fields (name, category, price, etc.)
            from the JSON body, then insert them into the 'catalog' table.
            If successful, I return a 201 response; otherwise, I return an error.
        */
        $name = $data['name'] ?? '';
        $category = $data['category'] ?? '';
        $price = (float)($data['price'] ?? 0);
        $image_url = $data['image_url'] ?? '';
        $alt_text = $data['alt_text'] ?? '';

        $stmt = $conn->prepare("
            INSERT INTO catalog (name, category, price, image_url, alt_text)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->bind_param('ssdss', $name, $category, $price, $image_url, $alt_text);

        if (!$stmt->execute()) {
            respond(500, ['error' => 'Failed to create catalog item']);
        }

        respond(201, ['message' => 'Item created successfully']);
        break;

    // ========== UPDATE CATALOG ITEM ==========
    case '/api.php/catalog:PUT':
        /*
            Updating a catalog item requires the item 'id' in the JSON body.
            I also allow updating the name, category, price, image_url, and alt_text.
            If something goes wrong or the 'id' is invalid, I respond with an error.
        */
        $id = (int)($data['id'] ?? 0);
        $name = $data['name'] ?? '';
        $category = $data['category'] ?? '';
        $price = (float)($data['price'] ?? 0);
        $image_url = $data['image_url'] ?? '';
        $alt_text = $data['alt_text'] ?? '';

        if (!$id) {
            respond(400, ['error' => 'Invalid ID']);
        }

        $stmt = $conn->prepare("
            UPDATE catalog 
            SET name=?, category=?, price=?, image_url=?, alt_text=? 
            WHERE id=?
        ");
        $stmt->bind_param('ssdssi', $name, $category, $price, $image_url, $alt_text, $id);

        if (!$stmt->execute()) {
            respond(500, ['error' => 'Failed to update catalog item']);
        }

        respond(200, ['message' => 'Item updated successfully']);
        break;

    // ========== DELETE CATALOG ITEM ==========
    case '/api.php/catalog:DELETE':
        /*
            To delete a catalog item, I need the 'id' in the JSON body.
            Then I just run a DELETE query. If it doesn't work, I respond with an error.
        */
        $id = (int)($data['id'] ?? 0);
        if (!$id) {
            respond(400, ['error' => 'Invalid ID']);
        }

        $stmt = $conn->prepare("DELETE FROM catalog WHERE id=?");
        $stmt->bind_param('i', $id);

        if (!$stmt->execute()) {
            respond(500, ['error' => 'Failed to delete catalog item']);
        }

        respond(200, ['message' => 'Item deleted successfully']);
        break;

    // ========== GET ALL ADMINS ==========
    case '/api.php/admins:GET':
        /*
            Here, I'm returning all rows from the 'admins' table as a JSON array.
        */
        $res = $conn->query("SELECT * FROM admins");
        $adminsList = [];
        while ($row = $res->fetch_assoc()) {
            $adminsList[] = $row;
        }
        respond(200, $adminsList);
        break;

    // ========== UPDATE AN ADMIN ==========
    case '/api.php/admins:PUT':
        /*
            This route updates an admin's data. I require an 'id', and optionally name, email,
            or password. If the password is present, I'll hash it before updating. 
        */
        $adminID = (int)($data['id'] ?? 0);
        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (!$adminID) {
            respond(400, ['error' => 'Invalid admin ID']);
        }

        if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            respond(400, ['error' => 'Invalid admin email']);
        }

        // Build the SQL dynamically based on what was provided
        $sql = "UPDATE admins SET name=?";
        $params = [$name];
        $types = "s";

        if (!empty($email)) {
            $sql .= ", email=?";
            $params[] = $email;
            $types .= "s";
        }

        if (!empty($password)) {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $sql .= ", password=?";
            $params[] = $hashed_password;
            $types .= "s";
        }

        $sql .= " WHERE id=?";
        $params[] = $adminID;
        $types .= "i";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        if (!$stmt->execute()) {
            respond(500, ['error' => 'Failed to update admin']);
        }

        respond(200, ['message' => 'Admin updated successfully']);
        break;

    // ========== CREATE NEW ADMIN ==========
    case '/api.php/admins:POST':
        /*
            Creating a new admin requires a name, email, and password. I also
            validate the email. If all is good, I insert the new admin into the DB.
        */
        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            respond(400, ['error' => 'Invalid admin email']);
        }
        if (!$name || !$password) {
            respond(400, ['error' => 'Missing name or password']);
        }

        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("
            INSERT INTO admins (name, email, password)
            VALUES (?, ?, ?)
        ");
        $stmt->bind_param('sss', $name, $email, $hashed_password);

        if (!$stmt->execute()) {
            respond(500, ['error' => 'Failed to create new admin. Possibly duplicate email.']);
        }

        respond(201, ['message' => 'New admin created successfully']);
        break;

    // ========== DELETE AN ADMIN ==========
    case '/api.php/admins:DELETE':
        /*
            To delete an admin, I need an admin 'id'. Then I remove it from the 'admins' table.
        */
        $adminID = (int)($data['id'] ?? 0);
        if (!$adminID) {
            respond(400, ['error' => 'Invalid admin ID']);
        }

        $stmt = $conn->prepare("DELETE FROM admins WHERE id=?");
        $stmt->bind_param('i', $adminID);

        if (!$stmt->execute()) {
            respond(500, ['error' => 'Failed to delete admin']);
        }

        respond(200, ['message' => 'Admin removed successfully']);
        break;

    // ========== CREATE A NEW ORDER ==========
    case '/api.php/orders:POST':
        /*
            For orders, I'm expecting 'cartItems' (an array of items) and 'userEmail'.
            I store them in a JSON format in the 'orders' table, then return the new order's ID.
        */
        $cartItems = $data['cartItems'] ?? [];
        $userEmail = $data['userEmail'] ?? 'guest';

        // Convert order data to JSON for storage
        $jsonCart = json_encode([
            'userEmail' => $userEmail,
            'cartItems' => $cartItems
        ]);

        $stmt = $conn->prepare("INSERT INTO orders (order_data) VALUES (?)");
        $stmt->bind_param('s', $jsonCart);

        if (!$stmt->execute()) {
            respond(500, ['error' => 'Failed to create order.']);
        }

        $newOrderId = $stmt->insert_id;
        respond(201, [
            'message' => 'Order placed successfully!',
            'orderId' => $newOrderId
        ]);
        break;

    // ------------------- DEFAULT CASE -------------------
    default:
        /*
            If none of the above routes/methods match, I'll send a 404 error
            telling the client that the endpoint is not found.
        */
        respond(404, ['error' => 'Endpoint not found']);
}
?>
