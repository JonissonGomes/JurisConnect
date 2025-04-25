package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port            string
	MongoDBURI      string
	MongoDBDatabase string
	JWTSecret       string
	Environment     string
}

func LoadConfig() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		return nil, err
	}

	return &Config{
		Port:            getEnv("PORT", "8080"),
		MongoDBURI:      getEnv("MONGODB_URI", "mongodb://localhost:27017/jurisconnect"),
		MongoDBDatabase: getEnv("MONGODB_DATABASE", "jurisconnect"),
		JWTSecret:       getEnv("JWT_SECRET", "your-secret-key"),
		Environment:     getEnv("ENVIRONMENT", "development"),
	}, nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
