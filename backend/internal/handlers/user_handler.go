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
		Name      string `json:"name" binding:"required"`
		Email     string `json:"email" binding:"required,email"`
		Phone     string `json:"phone" binding:"required"`
		CPF       string `json:"cpf" binding:"required"`
		RG        string `json:"rg" binding:"required"`
		BirthDate string `json:"birth_date" binding:"required"`
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
		OABNumber    string   `json:"oab_number"`
		OABState     string   `json:"oab_state"`
		Specialties  []string `json:"specialties"`
		HireDate     string   `json:"hire_date" binding:"required"`
		Department   string   `json:"department" binding:"required"`
		SupervisorID string   `json:"supervisor_id"`
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

	// Converter datas para time.Time
	birthDate, err := time.Parse("02/01/2006", req.PersonalInfo.BirthDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data de nascimento inválido. Use o formato DD/MM/AAAA"})
		return
	}

	hireDate, err := time.Parse("02/01/2006", req.ProfessionalInfo.HireDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data de contratação inválido. Use o formato DD/MM/AAAA"})
		return
	}

	// Converter SupervisorID para ObjectID se fornecido
	var supervisorID primitive.ObjectID
	if req.ProfessionalInfo.SupervisorID != "" {
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
			BirthDate: birthDate,
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
			HireDate:     hireDate,
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

func (h *UserHandler) Update(c *gin.Context) {
	id := c.Param("id")
	_, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req domain.UpdateUserRequest
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

	// Atualizar campos pessoais
	if req.PersonalInfo.Name != "" {
		existingUser.PersonalInfo.Name = req.PersonalInfo.Name
	}
	if req.PersonalInfo.Email != "" {
		existingUser.PersonalInfo.Email = req.PersonalInfo.Email
	}
	if req.PersonalInfo.Phone != "" {
		existingUser.PersonalInfo.Phone = req.PersonalInfo.Phone
	}
	if req.PersonalInfo.CPF != "" {
		existingUser.PersonalInfo.CPF = req.PersonalInfo.CPF
	}
	if req.PersonalInfo.RG != "" {
		existingUser.PersonalInfo.RG = req.PersonalInfo.RG
	}
	if req.PersonalInfo.BirthDate != "" {
		birthDate, err := time.Parse("02/01/2006", req.PersonalInfo.BirthDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data de nascimento inválido. Use o formato DD/MM/AAAA"})
			return
		}
		existingUser.PersonalInfo.BirthDate = birthDate
	}

	// Atualizar endereço
	if req.PersonalInfo.Address != (domain.Address{}) {
		if req.PersonalInfo.Address.Street != "" {
			existingUser.PersonalInfo.Address.Street = req.PersonalInfo.Address.Street
		}
		if req.PersonalInfo.Address.Number != "" {
			existingUser.PersonalInfo.Address.Number = req.PersonalInfo.Address.Number
		}
		if req.PersonalInfo.Address.Complement != "" {
			existingUser.PersonalInfo.Address.Complement = req.PersonalInfo.Address.Complement
		}
		if req.PersonalInfo.Address.Neighborhood != "" {
			existingUser.PersonalInfo.Address.Neighborhood = req.PersonalInfo.Address.Neighborhood
		}
		if req.PersonalInfo.Address.City != "" {
			existingUser.PersonalInfo.Address.City = req.PersonalInfo.Address.City
		}
		if req.PersonalInfo.Address.State != "" {
			existingUser.PersonalInfo.Address.State = req.PersonalInfo.Address.State
		}
		if req.PersonalInfo.Address.ZipCode != "" {
			existingUser.PersonalInfo.Address.ZipCode = req.PersonalInfo.Address.ZipCode
		}
	}

	// Atualizar informações profissionais
	if req.ProfessionalInfo.OABNumber != "" {
		existingUser.ProfessionalInfo.OABNumber = req.ProfessionalInfo.OABNumber
	}
	if req.ProfessionalInfo.OABState != "" {
		existingUser.ProfessionalInfo.OABState = req.ProfessionalInfo.OABState
	}
	if req.ProfessionalInfo.Department != "" {
		existingUser.ProfessionalInfo.Department = req.ProfessionalInfo.Department
	}
	if len(req.ProfessionalInfo.Specialties) > 0 {
		existingUser.ProfessionalInfo.Specialties = req.ProfessionalInfo.Specialties
	}
	if req.ProfessionalInfo.HireDate != "" {
		hireDate, err := time.Parse("02/01/2006", req.ProfessionalInfo.HireDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data de contratação inválido. Use o formato DD/MM/AAAA"})
			return
		}

		// Validar se a data de contratação não é no futuro
		if hireDate.After(time.Now()) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "A data de contratação não pode ser no futuro"})
			return
		}

		// Validar se a data de contratação não é anterior a 1900
		minDate := time.Date(1900, 1, 1, 0, 0, 0, 0, time.UTC)
		if hireDate.Before(minDate) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "A data de contratação não pode ser anterior a 1900"})
			return
		}

		existingUser.ProfessionalInfo.HireDate = hireDate
	}
	if req.ProfessionalInfo.SupervisorID != "" {
		supervisorID, err := primitive.ObjectIDFromHex(req.ProfessionalInfo.SupervisorID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID do supervisor inválido"})
			return
		}
		existingUser.ProfessionalInfo.SupervisorID = supervisorID
	}

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
