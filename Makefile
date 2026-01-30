.PHONY: help install dev build clean docker-up docker-down migrate

help: ## Show this help message
	@echo "DevMark - Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "Installing API dependencies..."
	cd api && npm install
	@echo "Installing web dependencies..."
	cd web && npm install
	@echo "Done! Run 'make dev' to start development servers"

docker-up: ## Start PostgreSQL with Docker
	docker-compose up -d
	@echo "PostgreSQL is running on localhost:5432"
	@echo "Database: devmark, User: devmark, Password: devmark123"

docker-down: ## Stop Docker containers
	docker-compose down

migrate: ## Run database migrations
	cd api && npm run prisma:generate && npm run prisma:migrate

dev-api: ## Start API development server
	cd api && npm run dev

dev-web: ## Start web development server
	cd web && npm run dev

dev: ## Start both API and web development servers
	@echo "Starting API on port 4100 and Web on port 4200..."
	@echo "Open http://localhost:4200 in your browser"
	make -j2 dev-api dev-web

build: ## Build all projects
	@echo "Building API..."
	cd api && npm run build
	@echo "Building web..."
	cd web && npm run build
	@echo "Build complete!"

clean: ## Clean build artifacts and dependencies
	rm -rf api/node_modules api/dist
	rm -rf web/node_modules web/.next
	@echo "Cleaned!"

setup: docker-up install migrate ## Complete setup (Docker + Install + Migrate)
	@echo ""
	@echo "Setup complete! 🎉"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Start development: make dev"
	@echo "  2. Open http://localhost:3001"
	@echo "  3. Create an account"
	@echo ""

prisma-studio: ## Open Prisma Studio (database GUI)
	cd api && npm run prisma:studio
