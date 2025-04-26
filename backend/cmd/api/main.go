package main

import (
	"log"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/jurisconnect/backend/internal/config"
	"github.com/jurisconnect/backend/internal/database"
	"github.com/jurisconnect/backend/internal/handlers"
	"github.com/jurisconnect/backend/internal/repositories"
	"github.com/jurisconnect/backend/internal/routes"
	"github.com/jurisconnect/backend/internal/services"
)

func main() {
	// Tentar carregar .env da raiz do projeto
	if err := godotenv.Load(); err != nil {
		log.Printf("Aviso: arquivo .env não encontrado na raiz: %v", err)

		// Tentar carregar .env do diretório backend
		backendEnvPath := filepath.Join("backend", ".env")
		if err := godotenv.Load(backendEnvPath); err != nil {
			log.Printf("Aviso: arquivo .env não encontrado em %s: %v", backendEnvPath, err)
		} else {
			log.Printf("Arquivo .env carregado de %s", backendEnvPath)
		}
	} else {
		log.Printf("Arquivo .env carregado da raiz do projeto")
	}

	// Carregar configuração
	cfg := config.Load()
	log.Printf("Configuração carregada - MongoDB URI: %s", cfg.MongoDB.URI)
	log.Printf("Configuração carregada - MongoDB Database: %s", cfg.MongoDB.Database)

	// Inicializar conexão com MongoDB
	db, err := database.NewMongoDB(cfg)
	if err != nil {
		log.Fatalf("Erro ao conectar ao MongoDB: %v", err)
	}
	defer db.Close()

	// Verificar conexão
	if err := db.Ping(); err != nil {
		log.Fatalf("Erro ao pingar o MongoDB: %v", err)
	}
	log.Println("Conexão com MongoDB estabelecida com sucesso!")

	// Inicializar repositório
	userRepo := repositories.NewUserRepository(db)

	// Inicializar serviço
	userService := services.NewUserService(userRepo)

	// Inicializar handler
	userHandler := handlers.NewUserHandler(userService)

	// Configurar router
	router := gin.Default()

	// Configurar rotas
	routes.SetupRoutes(router, userHandler)

	// Iniciar servidor
	port := cfg.Server.Port
	log.Printf("Servidor iniciado na porta %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
