# Multi-stage build
# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/webapp
COPY webapp/package*.json ./
RUN npm ci

COPY webapp/ ./
RUN npm run build

# Stage 2: Build the Go backend
FROM golang:1.23-alpine AS backend-builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main cmd/api/main.go

# Stage 3: Final image
FROM alpine:latest

RUN apk --no-cache add ca-certificates

# Create a non-root user first
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

# Set working directory
WORKDIR /app

# Copy the Go binary with proper permissions
COPY --from=backend-builder /app/main ./main
RUN chmod +x ./main

# Copy the built frontend
COPY --from=frontend-builder /app/webapp/dist ./webapp/dist

# Change ownership to appuser
RUN chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 8080

# Command to run with absolute path
CMD ["/app/main"]