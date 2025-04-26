package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/jurisconnect/backend/internal/handlers"
)

func SetupRoutes(router *gin.Engine, userHandler *handlers.UserHandler) {
	// Rotas públicas
	public := router.Group("/api")
	{
		public.POST("/login", userHandler.Login)
	}

	// Rotas protegidas
	protected := router.Group("/api")
	// TODO: Adicionar middleware de autenticação
	{
		protected.POST("/users", userHandler.Create)
		protected.GET("/users/:id", userHandler.GetByID)
		protected.GET("/users/email/:email", userHandler.GetByEmail)
		protected.GET("/users/oab/:number/:state", userHandler.GetByOAB)
		protected.GET("/users/department/:department", userHandler.GetByDepartment)
		protected.PUT("/users/:id", userHandler.Update)
		protected.DELETE("/users/:id", userHandler.DeleteUser)
	}
}
