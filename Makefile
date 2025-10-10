# Variables
APP_NAME = keeper-prompt
API_PORT = 8080

# Colors for output
GREEN = \033[0;32m
YELLOW = \033[0;33m
NC = \033[0m # No Color

.PHONY: help dev prod clean

help: ## Show available commands
	@echo "$(GREEN)Available commands:$(NC)"
	@echo "  $(YELLOW)make dev$(NC)  - Run backend and webapp in development mode"
	@echo "  $(YELLOW)make prod$(NC) - Build webapp and run backend for production"
	@echo "  $(YELLOW)make clean$(NC) - Clean build files"

dev: ## Run development mode (backend + webapp separately)
	@echo "$(GREEN)Starting development mode...$(NC)"
	@echo "$(YELLOW)Starting backend on port $(API_PORT)...$(NC)"
	@go run cmd/api/main.go &
	@echo "$(YELLOW)Starting webapp on port 5173...$(NC)"
	@cd webapp && npm run dev &
	@echo "$(GREEN)Both services started. Press Ctrl+C to stop.$(NC)"
	@wait

prod: ## Build webapp and run backend for production
	@echo "$(GREEN)Building for production...$(NC)"
	@echo "$(YELLOW)Building webapp...$(NC)"
	@cd webapp && npm run build
	@echo "$(YELLOW)Starting backend...$(NC)"
	@go run cmd/api/main.go

clean: ## Clean build files
	@echo "$(GREEN)Cleaning build files...$(NC)"
	@rm -rf webapp/dist
	@rm -rf build