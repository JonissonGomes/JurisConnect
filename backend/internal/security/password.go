package security

import (
	"crypto/rand"
	"encoding/base64"
	"errors"

	"golang.org/x/crypto/bcrypt"
)

const (
	// Cost define o custo do algoritmo de hash
	// Valores mais altos tornam o hash mais seguro mas mais lento
	Cost = 12
)

// HashPassword cria um hash seguro da senha
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), Cost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// CheckPassword verifica se a senha corresponde ao hash
func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateRandomPassword gera uma senha aleatória segura
func GenerateRandomPassword(length int) (string, error) {
	if length < 8 {
		return "", errors.New("o comprimento mínimo da senha deve ser 8")
	}

	// Gerar bytes aleatórios
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	// Converter para string base64
	password := base64.URLEncoding.EncodeToString(bytes)

	// Garantir que a senha tenha o comprimento desejado
	if len(password) > length {
		password = password[:length]
	}

	return password, nil
}

// ValidatePasswordStrength verifica se a senha atende aos requisitos de segurança
func ValidatePasswordStrength(password string) error {
	if len(password) < 8 {
		return errors.New("a senha deve ter pelo menos 8 caracteres")
	}

	var (
		hasUpper   bool
		hasLower   bool
		hasNumber  bool
		hasSpecial bool
	)

	for _, char := range password {
		switch {
		case 'A' <= char && char <= 'Z':
			hasUpper = true
		case 'a' <= char && char <= 'z':
			hasLower = true
		case '0' <= char && char <= '9':
			hasNumber = true
		case char == '!' || char == '@' || char == '#' || char == '$' || char == '%' || char == '^' || char == '&' || char == '*':
			hasSpecial = true
		}
	}

	if !hasUpper {
		return errors.New("a senha deve conter pelo menos uma letra maiúscula")
	}
	if !hasLower {
		return errors.New("a senha deve conter pelo menos uma letra minúscula")
	}
	if !hasNumber {
		return errors.New("a senha deve conter pelo menos um número")
	}
	if !hasSpecial {
		return errors.New("a senha deve conter pelo menos um caractere especial (!@#$%^&*)")
	}

	return nil
}
