# =========================================================================
# HireSense AI - Backend Multi-Stage Dockerfile
# =========================================================================

# Stage 1: Build Stage
FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copy POM and download dependencies to optimize caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package application JAR (skipping tests during image build)
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Production Runtime Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Security: Create non-root user
RUN addgroup -S hiresense && adduser -S hiresense -G hiresense

# Create persistent storage directories
RUN mkdir -p /app/storage/resumes && chown -R hiresense:hiresense /app

# Copy executable jar from builder stage
COPY --from=builder /app/target/hiresense-backend-*.jar /app/app.jar
RUN chown hiresense:hiresense /app/app.jar

# Switch to non-root user
USER hiresense

# Service Port
EXPOSE 8080

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Launch Spring Boot Application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
