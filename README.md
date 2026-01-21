# Bakery Web Application: End-to-End DevOps Deployment
## Cloud Architecture on AWS: EC2, RDS, Docker, and Kubernetes (EKS)

This project demonstrates a full production-grade deployment of a Java-based Bakery Web Application. It covers containerization with Docker, managed database setup with RDS, and orchestration with AWS EKS.

---

## Phase 1: Local Environment & Infrastructure Setup
### Section 1: AWS RDS (Database) Setup
#### H4 – Database Configuration
Before launching servers, we set up a managed MySQL database.
1. Go to **RDS Console** -> **Create Database**.
2. Select **MySQL 8.0** (Free Tier).
3. **DB Instance Identifier**: `bakery-db`.
4. **Master Username**: `admin`.
5. **Master Password**: `YourSecurePassword123`.
6. **Public Access**: No.
7. **Initial Database Name**: `bakery_db`.

### Section 2: AWS EC2 (Management Server) Setup
#### H4 – Launching the Instance
This instance acts as our build and management server.
1. **AMI**: Ubuntu 22.04 LTS.
2. **Instance Type**: t2.micro.
3. **Security Group**: Allow SSH (22), HTTP (80), and Custom TCP (8080).

---

## Phase 2: Server Configuration & Tools Installation
### Section 1: Installing Docker & DevOps Tools
#### H4 – Command Sequence for EC2
Connect to your EC2 via SSH and run the following in sequence:

##### H5 – Install Docker
```bash
sudo apt update -y
sudo apt install docker.io -y
sudo systemctl start docker
sudo usermod -aG docker ubuntu
# Log out and back in for permissions
```

##### H5 – Install AWS CLI v2
```bash
sudo apt install unzip curl -y
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
```

##### H5 – Install kubectl
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

---

## Phase 3: Containerization & Image Management
### Section 1: Building Docker Images
#### H4 – Frontend and Backend Build
Navigate to your project directory and build the images:

```bash
# Build Backend
cd backend-java
docker build -t your-dockerhub-id/bakery-backend:latest .

# Build Frontend
cd ..
docker build -t your-dockerhub-id/bakery-frontend:latest .
```

### Section 2: Docker Hub Registry
#### H4 – Pushing Images
```bash
docker login
docker push your-dockerhub-id/bakery-backend:latest
docker push your-dockerhub-id/bakery-frontend:latest
```

---

## Phase 4: AWS EKS (Kubernetes) Deployment
### Section 1: Cluster & Node Group Setup
#### H4 – Console Configuration
1. **Create EKS Cluster**: Use the AWS Console to create a cluster in `ca-central-1`.
2. **Create Node Group**: 
   - **Name**: `bakery-nodes`.
   - **Node IAM Role**: Must include `AmazonEKSWorkerNodePolicy`, `AmazonEKS_CNI_Policy`, and `AmazonEC2ContainerRegistryReadOnly`.
   - **Instance Type**: t3.medium.
   - **Scaling**: Min 1, Desired 2, Max 3.

### Section 2: Connecting to EKS
#### H4 – Updating Kubeconfig
```bash
aws configure # Enter your Access Key & Secret
aws eks update-kubeconfig --region ca-central-1 --name your-cluster-name
kubectl get nodes # Verify nodes are 'Ready'
```

---

## Phase 5: Kubernetes Orchestration
### Section 1: Creating Manifests
#### H4 – The bakery-deployment.yaml File
Create a file named `bakery-deployment.yaml` with the following structure:

```yaml
# Includes:
# 1. Backend Deployment (2 Replicas) + Environment Variables for RDS
# 2. Backend Service (Type: LoadBalancer)
# 3. Frontend Deployment (2 Replicas)
# 4. Frontend Service (Type: LoadBalancer)
```

### Section 2: Applying Configuration
#### H4 – Launching Pods
```bash
kubectl apply -f bakery-deployment.yaml
kubectl get pods # Wait for Running status
kubectl get svc  # Get External-IP URLs
```

---

## Phase 6: Final Connectivity & Output
### Section 1: Database Security Group Fix
#### H4 – Allowing EKS to talk to RDS
1. Go to **EC2 Console** -> **Worker Node Security Group**.
2. Copy the **Security Group ID**.
3. Go to **RDS Console** -> **Database Security Group** -> **Inbound Rules**.
4. Add Rule: **MySQL (3306)**, Source: **Worker Node Security Group ID**.

### Section 2: Verifying Output
#### H4 – Accessing the Website
1. Run `kubectl get svc frontend-service` to get the **External-IP**.
2. Open the URL in your browser.
3. Test the **Contact Form**: The browser calls the **Backend LoadBalancer**, which saves data into **AWS RDS**.

###### H6 – End of Documentation
