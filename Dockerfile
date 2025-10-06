# =============================================================
# Stage 1: Backend Build (Java / Maven)
# =============================================================
FROM maven:3.9.5-eclipse-temurin-21-alpine AS backend-build
WORKDIR /app/backend

# Copy Maven files and install dependencies
COPY expense-splitter/pom.xml .
RUN mvn dependency:go-offline

# Copy source code and build
COPY expense-splitter/src src
RUN mvn package -DskipTests


# =============================================================
# Stage 2: Backend Runner (Spring Boot)
# =============================================================
FROM eclipse-temurin:21-jre-alpine AS backend-runner
WORKDIR /app

COPY --from=backend-build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]


# =============================================================
# Stage 3: Frontend Runner (React / Node)
# =============================================================
FROM node:20-alpine AS frontend-runner
WORKDIR /app/frontend

# Copy dependency manifests and install dependencies
COPY expense-splitter-frontend/package*.json ./
RUN npm install

# Copy source code
COPY expense-splitter-frontend/ ./

# React dev server listens on port 3000 by default
EXPOSE 3000

# Start the React development server
CMD ["npm", "start"]
