package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Case struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	Status      string             `bson:"status" json:"status"`
	ClientID    primitive.ObjectID `bson:"client_id" json:"client_id"`
	LawyerID    primitive.ObjectID `bson:"lawyer_id" json:"lawyer_id"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}

type CaseRepository interface {
	Create(case_ *Case) error
	FindByID(id string) (*Case, error)
	FindByClientID(clientID string) ([]*Case, error)
	FindByLawyerID(lawyerID string) ([]*Case, error)
	Update(case_ *Case) error
	Delete(id string) error
}

type CaseService interface {
	Create(case_ *Case) error
	GetByID(id string) (*Case, error)
	GetByClientID(clientID string) ([]*Case, error)
	GetByLawyerID(lawyerID string) ([]*Case, error)
	Update(case_ *Case) error
	Delete(id string) error
}
