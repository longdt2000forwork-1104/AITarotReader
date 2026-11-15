# Stage 1: Build JAR with Maven Wrapper
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Lightweight JRE runtime tuned for Render Free Tier (512MB RAM)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Render injects $PORT automatically; SerialGC + -Xmx300m prevents OOM in 512MB container
ENTRYPOINT ["sh", "-c", "exec java -Xmx300m -Xms128m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError -Dserver.port=${PORT:-8080} -jar app.jar"]
