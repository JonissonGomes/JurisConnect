package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Document struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	URL         string             `bson:"url" json:"url"`
	CaseID      primitive.ObjectID `bson:"case_id" json:"case_id"`
	CreatedBy   primitive.ObjectID `bson:"created_by" json:"created_by"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}

type DocumentRepository interface {
	Create(document *Document) error
	FindByID(id string) (*Document, error)
	FindByCaseID(caseID string) ([]*Document, error)
	Update(document *Document) error
	Delete(id string) error
}

type DocumentService interface {
	Create(document *Document) error
	GetByID(id string) (*Document, error)
	GetByCaseID(caseID string) ([]*Document, error)
	Update(document *Document) error
	Delete(id string) error
}
