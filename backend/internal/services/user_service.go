package services

import (
	"errors"
	"regexp"
	"time"

	"github.com/jurisconnect/backend/internal/domain"
	"github.com/jurisconnect/backend/internal/repositories"
	"github.com/jurisconnect/backend/internal/security"
)

type UserService struct {
	userRepo domain.UserRepository
}

func NewUserService(userRepo domain.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) validatePhone(phone string) error {
	// Remove todos os caracteres não numéricos
	re := regexp.MustCompile(`[^0-9]`)
	cleanPhone := re.ReplaceAllString(phone, "")

	// Verifica se o telefone tem entre 10 e 11 dígitos (com DDD)
	if len(cleanPhone) < 10 || len(cleanPhone) > 11 {
		return errors.New("telefone deve conter entre 10 e 11 dígitos")
	}

	return nil
}

func (s *UserService) Create(user *domain.User) error {
	// Validar força da senha
	if err := security.ValidatePasswordStrength(user.Password); err != nil {
		return err
	}

	// Validar telefone
	if err := s.validatePhone(user.PersonalInfo.Phone); err != nil {
		return err
	}

	// Verificar se o email já existe
	existingUser, err := s.userRepo.FindByEmail(user.PersonalInfo.Email)
	if err != nil && err != repositories.ErrUserNotFound {
		return err
	}
	if existingUser != nil {
		return repositories.ErrDuplicateEmail
	}

	// Verificar se o OAB já existe para advogados
	if user.Role == "lawyer" {
		existingLawyer, err := s.userRepo.FindByOAB(user.ProfessionalInfo.OABNumber, user.ProfessionalInfo.OABState)
		if err != nil && err != repositories.ErrUserNotFound {
			return err
		}
		if existingLawyer != nil {
			return repositories.ErrDuplicateOAB
		}
	}

	// Hash da senha
	hashedPassword, err := security.HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword

	// Definir timestamps
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now
	user.IsActive = true

	return s.userRepo.Create(user)
}

func (s *UserService) GetByID(id string) (*domain.User, error) {
	return s.userRepo.FindByID(id)
}

func (s *UserService) GetByEmail(email string) (*domain.User, error) {
	return s.userRepo.FindByEmail(email)
}

func (s *UserService) GetByOAB(oabNumber, oabState string) (*domain.User, error) {
	return s.userRepo.FindByOAB(oabNumber, oabState)
}

func (s *UserService) GetByDepartment(department string) ([]*domain.User, error) {
	return s.userRepo.FindByDepartment(department)
}

func (s *UserService) Update(user *domain.User) error {
	// Verificar se o usuário existe
	existingUser, err := s.userRepo.FindByID(user.ID.Hex())
	if err != nil {
		return err
	}

	// Validar telefone se foi alterado
	if user.PersonalInfo.Phone != existingUser.PersonalInfo.Phone {
		if err := s.validatePhone(user.PersonalInfo.Phone); err != nil {
			return err
		}
	}

	// Verificar se o email foi alterado e se já existe
	if user.PersonalInfo.Email != existingUser.PersonalInfo.Email {
		emailUser, err := s.userRepo.FindByEmail(user.PersonalInfo.Email)
		if err != nil && err != repositories.ErrUserNotFound {
			return err
		}
		if emailUser != nil {
			return repositories.ErrDuplicateEmail
		}
	}

	// Verificar se o OAB foi alterado e se já existe (para advogados)
	if user.Role == "lawyer" &&
		(user.ProfessionalInfo.OABNumber != existingUser.ProfessionalInfo.OABNumber ||
			user.ProfessionalInfo.OABState != existingUser.ProfessionalInfo.OABState) {
		oabUser, err := s.userRepo.FindByOAB(user.ProfessionalInfo.OABNumber, user.ProfessionalInfo.OABState)
		if err != nil && err != repositories.ErrUserNotFound {
			return err
		}
		if oabUser != nil {
			return repositories.ErrDuplicateOAB
		}
	}

	// Se a senha foi alterada, validar e fazer hash
	if user.Password != "" && user.Password != existingUser.Password {
		if err := security.ValidatePasswordStrength(user.Password); err != nil {
			return err
		}
		hashedPassword, err := security.HashPassword(user.Password)
		if err != nil {
			return err
		}
		user.Password = hashedPassword
	} else {
		// Manter a senha existente
		user.Password = existingUser.Password
	}

	// Atualizar timestamp
	user.UpdatedAt = time.Now()

	return s.userRepo.Update(user)
}

func (s *UserService) Delete(id string) error {
	return s.userRepo.Delete(id)
}

func (s *UserService) UpdateLastLogin(id string) error {
	return s.userRepo.UpdateLastLogin(id)
}

func (s *UserService) HasPermission(userID string, module string, action string) (bool, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return false, err
	}

	// Verificar permissões baseadas no papel
	switch user.Role {
	case "admin":
		return true, nil
	case "lawyer":
		return module == "cases" || module == "documents", nil
	case "intern":
		return module == "cases" && action == "read", nil
	case "secretary":
		return module == "cases" && action == "read", nil
	default:
		return false, nil
	}
}
