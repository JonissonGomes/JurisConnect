package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jurisconnect/backend/internal/domain"
	"github.com/jurisconnect/backend/internal/repositories"
	"github.com/jurisconnect/backend/internal/security"
	"github.com/jurisconnect/backend/internal/services"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

type CreateUserRequest struct {
	PersonalInfo struct {
		Name      string    `json:"name" binding:"required"`
		Email     string    `json:"email" binding:"required,email"`
		Phone     string    `json:"phone" binding:"required"`
		CPF       string    `json:"cpf" binding:"required"`
		RG        string    `json:"rg" binding:"required"`
		BirthDate time.Time `json:"birth_date" binding:"required"`
		Address   struct {
			Street       string `json:"street" binding:"required"`
			Number       string `json:"number" binding:"required"`
			Complement   string `json:"complement"`
			Neighborhood string `json:"neighborhood" binding:"required"`
			City         string `json:"city" binding:"required"`
			State        string `json:"state" binding:"required"`
			ZipCode      string `json:"zip_code" binding:"required"`
		} `json:"address" binding:"required"`
	} `json:"personal_info" binding:"required"`
	ProfessionalInfo struct {
		OABNumber    string    `json:"oab_number"`
		OABState     string    `json:"oab_state"`
		Specialties  []string  `json:"specialties"`
		HireDate     time.Time `json:"hire_date" binding:"required"`
		Department   string    `json:"department" binding:"required"`
		SupervisorID string    `json:"supervisor_id"`
	} `json:"professional_info" binding:"required"`
	Role     string `json:"role" binding:"required,oneof=admin lawyer intern secretary"`
	Password string `json:"password" binding:"required,min=6"`
}

func (h *UserHandler) Create(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Converter SupervisorID para ObjectID se fornecido
	var supervisorID primitive.ObjectID
	if req.ProfessionalInfo.SupervisorID != "" {
		var err error
		supervisorID, err = primitive.ObjectIDFromHex(req.ProfessionalInfo.SupervisorID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID do supervisor inválido"})
			return
		}
	}

	user := &domain.User{
		PersonalInfo: domain.PersonalInfo{
			Name:      req.PersonalInfo.Name,
			Email:     req.PersonalInfo.Email,
			Phone:     req.PersonalInfo.Phone,
			CPF:       req.PersonalInfo.CPF,
			RG:        req.PersonalInfo.RG,
			BirthDate: req.PersonalInfo.BirthDate,
			Address: domain.Address{
				Street:       req.PersonalInfo.Address.Street,
				Number:       req.PersonalInfo.Address.Number,
				Complement:   req.PersonalInfo.Address.Complement,
				Neighborhood: req.PersonalInfo.Address.Neighborhood,
				City:         req.PersonalInfo.Address.City,
				State:        req.PersonalInfo.Address.State,
				ZipCode:      req.PersonalInfo.Address.ZipCode,
			},
		},
		ProfessionalInfo: domain.ProfessionalInfo{
			OABNumber:    req.ProfessionalInfo.OABNumber,
			OABState:     req.ProfessionalInfo.OABState,
			Specialties:  req.ProfessionalInfo.Specialties,
			HireDate:     req.ProfessionalInfo.HireDate,
			Department:   req.ProfessionalInfo.Department,
			SupervisorID: supervisorID,
		},
		Role:      req.Role,
		Password:  req.Password,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := h.userService.Create(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}

func (h *UserHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	user, err := h.userService.GetByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "usuário não encontrado"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) GetByDepartment(c *gin.Context) {
	department := c.Param("department")
	users, err := h.userService.GetByDepartment(department)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) GetByOAB(c *gin.Context) {
	oabNumber := c.Param("number")
	oabState := c.Param("state")
	user, err := h.userService.GetByOAB(oabNumber, oabState)
	if err != nil {
		if err == repositories.ErrUserNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "usuário não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) GetByEmail(c *gin.Context) {
	email := c.Param("email")
	user, err := h.userService.GetByEmail(email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "usuário não encontrado"})
		return
	}

	c.JSON(http.StatusOK, user)
}

type UpdateUserRequest struct {
	PersonalInfo struct {
		Name    string `json:"name"`
		Email   string `json:"email" binding:"omitempty,email"`
		Phone   string `json:"phone"`
		Address struct {
			Street       string `json:"street"`
			Number       string `json:"number"`
			Complement   string `json:"complement"`
			Neighborhood string `json:"neighborhood"`
			City         string `json:"city"`
			State        string `json:"state"`
			ZipCode      string `json:"zip_code"`
		} `json:"address"`
	} `json:"personal_info"`
	ProfessionalInfo struct {
		Specialties  []string `json:"specialties"`
		Department   string   `json:"department"`
		SupervisorID string   `json:"supervisor_id"`
	} `json:"professional_info"`
	Password string `json:"password" binding:"omitempty,min=6"`
	IsActive bool   `json:"is_active"`
}

func (h *UserHandler) Update(c *gin.Context) {
	id := c.Param("id")
	_, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buscar usuário existente
	existingUser, err := h.userService.GetByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if existingUser == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "usuário não encontrado"})
		return
	}

	// Atualizar campos
	if req.PersonalInfo.Name != "" {
		existingUser.PersonalInfo.Name = req.PersonalInfo.Name
	}
	if req.PersonalInfo.Email != "" {
		existingUser.PersonalInfo.Email = req.PersonalInfo.Email
	}
	if req.PersonalInfo.Phone != "" {
		existingUser.PersonalInfo.Phone = req.PersonalInfo.Phone
	}
	if req.PersonalInfo.Address.Street != "" {
		existingUser.PersonalInfo.Address = domain.Address{
			Street:       req.PersonalInfo.Address.Street,
			Number:       req.PersonalInfo.Address.Number,
			Complement:   req.PersonalInfo.Address.Complement,
			Neighborhood: req.PersonalInfo.Address.Neighborhood,
			City:         req.PersonalInfo.Address.City,
			State:        req.PersonalInfo.Address.State,
			ZipCode:      req.PersonalInfo.Address.ZipCode,
		}
	}

	if len(req.ProfessionalInfo.Specialties) > 0 {
		existingUser.ProfessionalInfo.Specialties = req.ProfessionalInfo.Specialties
	}
	if req.ProfessionalInfo.Department != "" {
		existingUser.ProfessionalInfo.Department = req.ProfessionalInfo.Department
	}
	if req.ProfessionalInfo.SupervisorID != "" {
		supervisorID, err := primitive.ObjectIDFromHex(req.ProfessionalInfo.SupervisorID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID do supervisor inválido"})
			return
		}
		existingUser.ProfessionalInfo.SupervisorID = supervisorID
	}

	if req.Password != "" {
		existingUser.Password = req.Password
	}

	existingUser.IsActive = req.IsActive
	existingUser.UpdatedAt = time.Now()

	if err := h.userService.Update(existingUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, existingUser)
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if err := h.userService.Delete(id); err != nil {
		if err == repositories.ErrUserNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "usuário não encontrado"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "erro ao deletar usuário"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "usuário deletado com sucesso"})
}

func (h *UserHandler) Login(c *gin.Context) {
	var loginRequest struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.userService.GetByEmail(loginRequest.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "credenciais inválidas"})
		return
	}

	// Verificar se a senha está correta
	if !security.CheckPassword(loginRequest.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "credenciais inválidas"})
		return
	}

	if err := h.userService.UpdateLastLogin(user.ID.Hex()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "erro ao atualizar último login"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "login realizado com sucesso",
		"user": gin.H{
			"id":    user.ID.Hex(),
			"name":  user.PersonalInfo.Name,
			"email": user.PersonalInfo.Email,
			"role":  user.Role,
		},
	})
}
