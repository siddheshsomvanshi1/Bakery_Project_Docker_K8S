# Bakery Web Application - System Documentation

This repository contains a professional containerized Bakery Web Application. Below are the comprehensive system diagrams illustrating the architecture, data flow, and design patterns used in the project.

---

## 1. System Overview & Use Case Diagram
The Use Case Diagram defines the interactions between users and the system's core functionalities within the AWS Cloud environment.

```mermaid
usecaseDiagram
    actor "Customer" as C
    actor "Admin" as A
    
    package "AWS Cloud - Bakery System" {
        usecase "Browse Products" as UC1
        usecase "View Team & Testimonials" as UC2
        usecase "Submit Contact Inquiry" as UC3
        usecase "Manage Database (RDS)" as UC4
    }
    
    C --> UC1
    C --> UC2
    C --> UC3
    A --> UC4
    UC1 ..> UC4 : <<include>>
```

---

## 2. Technical Architecture (AWS & Docker Deployment)
The application is deployed using a multi-container Docker architecture hosted on AWS. It leverages AWS RDS for managed database services and Docker for service isolation.

```mermaid
graph TD
    subgraph "AWS Cloud (VPC)"
        subgraph "Public Subnet"
            subgraph "Docker Host (EC2)"
                A[Frontend Container: Nginx]
                B[Backend Container: Java App]
            end
        end
        
        subgraph "Private Subnet"
            C[(AWS RDS: MySQL Instance)]
        end
        
        IGW[Internet Gateway]
    end
    
    Internet((User Browser)) --> IGW
    IGW --> A
    A -- REST API Calls --> B
    B -- JDBC / SSL --> C
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#dfd,stroke:#333,stroke-width:2px
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
    JsonHandler ..> DB : fetches data from RDS
    ContactHandler ..> DB : saves inquiries to RDS
```

---

## 4. Entity-Relationship (ER) Diagram
The database schema in AWS RDS is designed to store product information, team details, testimonials, and customer inquiries with clear relationships.

```mermaid
erDiagram
    ADMIN ||--o{ PRODUCTS : manages
    ADMIN ||--o{ TEAM : manages
    ADMIN ||--o{ TESTIMONIALS : manages
    CUSTOMER ||--o{ CONTACT_MESSAGES : sends
    
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

## 5. Sequence Diagram (AWS API Flow)
This diagram illustrates the sequence of events when a user visits the bakery website and views products, highlighting the cross-service communication.

```mermaid
sequenceDiagram
    autonumber
    participant U as Customer (Internet)
    participant F as Frontend (Docker/EC2)
    participant B as Backend (Docker/EC2)
    participant D as AWS RDS (MySQL)
    
    U->>F: Request index.html via AWS IGW
    F-->>U: Return Static Files (JS/CSS)
    U->>B: GET /api/products
    Note right of B: API Logic Execution
    B->>D: JDBC Query: SELECT * FROM products
    D-->>B: Return Data Rows
    B->>B: Serialize to JSON
    B-->>U: HTTP 200 (Product JSON)
    U->>U: Render Dynamic UI
```

---

## 6. Data Flow Diagram (DFD - AWS Environment)
A high-level view of how data flows from the user interface through the AWS-hosted processing layers to the RDS storage.

```mermaid
graph LR
    User((Customer))
    
    subgraph "AWS Processing Infrastructure"
        P1[Frontend Presentation]
        P2[API Request Handler]
        P3[Database Access Layer]
    end
    
    Storage[(AWS RDS MySQL)]
    
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
