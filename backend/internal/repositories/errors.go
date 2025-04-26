package repositories

import "errors"

var (
	// ErrUserNotFound é retornado quando um usuário não é encontrado
	ErrUserNotFound = errors.New("usuário não encontrado")

	// ErrDuplicateEmail é retornado quando tenta-se criar um usuário com email já existente
	ErrDuplicateEmail = errors.New("email já está em uso")

	// ErrDuplicateOAB é retornado quando tenta-se criar um advogado com OAB já existente
	ErrDuplicateOAB = errors.New("OAB já está em uso")
)
