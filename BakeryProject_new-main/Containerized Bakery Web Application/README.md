# Bakery Web Application - System Documentation

This repository contains a professional containerized Bakery Web Application. Below are the comprehensive system diagrams illustrating the architecture, data flow, and design patterns used in the project.

---

## 1. System Overview & Use Case Diagram
The Use Case Diagram defines the interactions between users and the system's core functionalities.

```mermaid
graph TD
    actor Customer
    actor Admin
    
    subgraph "Bakery Web System"
        UC1(Browse Products)
        UC2(View Team & Testimonials)
        UC3(Submit Contact Inquiry)
        UC4(Manage Database)
    end
    
    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Admin --> UC4
    UC1 -.-> UC4 : <<include>>
```

---

## 2. Technical Architecture (Docker Deployment)
The application is built using a multi-container Docker architecture. It consists of a Frontend service, a Java Backend service, and an external MySQL RDS database.

```mermaid
graph TD
    subgraph "Docker Environment"
        subgraph "Frontend Container (Port 80)"
            A[Web Server / Static Assets]
        end
        subgraph "Backend Container (Port 8080)"
            B[Java HTTP Server]
        end
    end
    
    subgraph "Cloud Infrastructure"
        C[(AWS RDS MySQL)]
    end
    
    Internet((User Browser)) --> A
    A -- REST API Calls --> B
    B -- JDBC / SQL --> C
```

---

## 3. Backend Class Diagram
This diagram shows the internal structure of the Java Backend, representing the relationships between the server, handlers, and the database interface.

```mermaid
classDiagram
    class BackendServer {
        +main(String[] args)
        +tryRegisterMySqlDriver()
        +addCors(HttpExchange)
    }
    
    class DB {
        +connect() Connection
        +productsJson() String
        +teamJson() String
        +testimonialsJson() String
        +saveContact(String body) String
        -esc(String s) String
    }
    
    class JsonHandler {
        -Supplier supplier
        +handle(HttpExchange exchange)
    }
    
    class ContactHandler {
        +handle(HttpExchange exchange)
    }
    
    BackendServer --> JsonHandler : instantiates
    BackendServer --> ContactHandler : instantiates
    JsonHandler ..> DB : fetches data
    ContactHandler ..> DB : saves inquiries
```

---

## 4. Entity-Relationship (ER) Diagram
The database schema is designed to store product information, team details, testimonials, and customer inquiries.

```mermaid
erDiagram
    PRODUCTS {
        int id PK
        string name
        decimal price
        string image
    }
    TEAM {
        int id PK
        string name
        string role
        string image
    }
    TESTIMONIALS {
        int id PK
        string name
        text content
    }
    CONTACT_MESSAGES {
        int id PK
        string payload
        timestamp received_at
    }
```

---

## 5. Sequence Diagram (Product Loading Flow)
This diagram illustrates the sequence of events when a user visits the bakery website and views products.

```mermaid
sequenceDiagram
    autonumber
    participant U as Customer
    participant F as Frontend Container
    participant B as Backend Container
    participant D as MySQL RDS
    
    U->>F: Request index.html
    F-->>U: Return Static Files (JS/CSS)
    U->>B: GET /api/products
    B->>D: Query: SELECT * FROM products
    D-->>B: Return Records
    B->>B: Process to JSON
    B-->>U: HTTP 200 (Product JSON)
    U->>U: Render Product UI
```

---

## 6. Data Flow Diagram (DFD - Level 1)
A high-level view of how data flows from the user interface through the processing layers to the data storage.

```mermaid
graph LR
    User((Customer))
    
    subgraph "Processing Layers"
        P1[Frontend Presentation]
        P2[API Request Handler]
        P3[Database Access Layer]
    end
    
    Storage[(MySQL RDS)]
    
    User -- Interaction --> P1
    P1 -- AJAX/JSON --> P2
    P2 -- Logic/Queries --> P3
    P3 -- SQL --> Storage
    Storage -- Data --> P3
    P3 -- JSON --> P1
    P1 -- Visual Update --> User
```

---

## 7. Activity Diagram (Contact Form Process)
The logic flow for a customer submitting a contact inquiry.

```mermaid
flowchart TD
    Start([Start]) --> Input[User fills Contact Form]
    Input --> Submit[User clicks Submit]
    Submit --> Valid{Is Data Valid?}
    
    Valid -- No --> Error[Show Validation Error]
    Error --> Input
    
    Valid -- Yes --> Req[Send POST to /api/contact]
    Req --> Save[Backend saves to DB]
    
    Save --> Success{Saved Successfully?}
    Success -- Yes --> Alert[Show Success Message]
    Success -- No --> DBError[Show Server Error]
    
    Alert --> End([End])
    DBError --> End
```

---

## How to Run the Project
1. Ensure you have **Docker** and **Docker Compose** installed.
2. Update the `DB_URL`, `DB_USER`, and `DB_PASS` in `docker-compose.yml` with your RDS credentials.
3. Run the following command:
   ```bash
   docker-compose up --build
   ```
4. Access the application at `http://localhost`.
