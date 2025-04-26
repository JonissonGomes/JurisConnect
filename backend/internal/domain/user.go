package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PersonalInfo     PersonalInfo       `bson:"personal_info" json:"personal_info"`
	ProfessionalInfo ProfessionalInfo   `bson:"professional_info" json:"professional_info"`
	Role             string             `bson:"role" json:"role"`
	Password         string             `bson:"password" json:"-"`
	IsActive         bool               `bson:"is_active" json:"is_active"`
	LastLogin        time.Time          `bson:"last_login" json:"last_login"`
	CreatedAt        time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt        time.Time          `bson:"updated_at" json:"updated_at"`
}

type PersonalInfo struct {
	Name      string    `bson:"name" json:"name"`
	Email     string    `bson:"email" json:"email"`
	Phone     string    `bson:"phone" json:"phone"`
	CPF       string    `bson:"cpf" json:"cpf"`
	RG        string    `bson:"rg" json:"rg"`
	BirthDate time.Time `bson:"birth_date" json:"birth_date"`
	Address   Address   `bson:"address" json:"address"`
}

type ProfessionalInfo struct {
	OABNumber    string             `bson:"oab_number" json:"oab_number,omitempty"`
	OABState     string             `bson:"oab_state" json:"oab_state,omitempty"`
	Specialties  []string           `bson:"specialties" json:"specialties,omitempty"`
	HireDate     time.Time          `bson:"hire_date" json:"hire_date"`
	Department   string             `bson:"department" json:"department"`
	SupervisorID primitive.ObjectID `bson:"supervisor_id,omitempty" json:"supervisor_id,omitempty"`
}

type Address struct {
	Street       string `bson:"street" json:"street"`
	Number       string `bson:"number" json:"number"`
	Complement   string `bson:"complement" json:"complement"`
	Neighborhood string `bson:"neighborhood" json:"neighborhood"`
	City         string `bson:"city" json:"city"`
	State        string `bson:"state" json:"state"`
	ZipCode      string `bson:"zip_code" json:"zip_code"`
}

type UserRepository interface {
	Create(user *User) error
	FindByID(id string) (*User, error)
	FindByEmail(email string) (*User, error)
	FindByOAB(oabNumber, oabState string) (*User, error)
	FindByDepartment(department string) ([]*User, error)
	Update(user *User) error
	Delete(id string) error
	UpdateLastLogin(id string) error
}

type UserService interface {
	Create(user *User) error
	GetByID(id string) (*User, error)
	GetByEmail(email string) (*User, error)
	GetByOAB(oabNumber, oabState string) (*User, error)
	GetByDepartment(department string) ([]*User, error)
	Update(user *User) error
	Delete(id string) error
	UpdateLastLogin(id string) error
	HasPermission(userID string, module string, action string) (bool, error)
}
