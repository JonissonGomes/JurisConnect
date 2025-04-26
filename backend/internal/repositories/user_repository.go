package repositories

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jurisconnect/backend/internal/database"
	"github.com/jurisconnect/backend/internal/domain"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type userRepository struct {
	db *database.MongoDB
}

func NewUserRepository(db *database.MongoDB) domain.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(user *domain.User) error {
	collection := r.db.Database.Collection("users")

	// Garantir que o ID seja nulo para o MongoDB gerar
	user.ID = primitive.NilObjectID

	result, err := collection.InsertOne(context.Background(), user)
	if err != nil {
		return err
	}

	// Atualizar o ID gerado pelo MongoDB
	user.ID = result.InsertedID.(primitive.ObjectID)
	return nil
}

func (r *userRepository) FindByID(id string) (*domain.User, error) {
	collection := r.db.Database.Collection("users")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var user domain.User
	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return &user, nil
}

func (r *userRepository) FindByEmail(email string) (*domain.User, error) {
	collection := r.db.Database.Collection("users")
	var user domain.User
	err := collection.FindOne(context.Background(), bson.M{"personal_info.email": email}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return &user, nil
}

func (r *userRepository) FindByOAB(oabNumber, oabState string) (*domain.User, error) {
	collection := r.db.Database.Collection("users")

	// Log dos parâmetros recebidos
	fmt.Printf("Buscando usuário com OAB: %s/%s\n", oabNumber, oabState)

	// Construir a query
	query := bson.M{
		"professional_info.oab_number": oabNumber,
		"professional_info.oab_state":  oabState,
	}

	// Log da query
	fmt.Printf("Query: %+v\n", query)

	var user domain.User
	err := collection.FindOne(context.Background(), query).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			fmt.Printf("Usuário não encontrado com OAB: %s/%s\n", oabNumber, oabState)
			return nil, ErrUserNotFound
		}
		fmt.Printf("Erro ao buscar usuário: %v\n", err)
		return nil, err
	}

	fmt.Printf("Usuário encontrado: %+v\n", user)
	return &user, nil
}

func (r *userRepository) FindByDepartment(department string) ([]*domain.User, error) {
	collection := r.db.Database.Collection("users")
	cursor, err := collection.Find(context.Background(), bson.M{"professional_info.department": department})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var users []*domain.User
	if err = cursor.All(context.Background(), &users); err != nil {
		return nil, err
	}

	return users, nil
}

func (r *userRepository) Update(user *domain.User) error {
	collection := r.db.Database.Collection("users")
	_, err := collection.ReplaceOne(context.Background(), bson.M{"_id": user.ID}, user)
	return err
}

func (r *userRepository) Delete(id string) error {
	collection := r.db.Database.Collection("users")

	// Converter o ID string para ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	// Deletar o documento usando o _id
	result, err := collection.DeleteOne(context.Background(), bson.M{"_id": objectID})
	if err != nil {
		return err
	}

	// Verificar se algum documento foi deletado
	if result.DeletedCount == 0 {
		return ErrUserNotFound
	}

	return nil
}

func (r *userRepository) UpdateLastLogin(id string) error {
	collection := r.db.Database.Collection("users")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	update := bson.M{
		"$set": bson.M{
			"last_login": time.Now(),
			"updated_at": time.Now(),
		},
	}

	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": objectID}, update)
	return err
}
