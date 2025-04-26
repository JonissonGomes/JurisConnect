package config

import (
	"os"
	"time"
)

type Config struct {
	Server  ServerConfig
	MongoDB MongoDBConfig
	JWT     JWTConfig
}

type ServerConfig struct {
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

type MongoDBConfig struct {
	URI      string
	Database string
	Timeout  time.Duration
}

type JWTConfig struct {
	Secret string
	Expiry time.Duration
}

func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port:         getEnv("PORT", "8080"),
			ReadTimeout:  time.Second * 15,
			WriteTimeout: time.Second * 15,
		},
		MongoDB: MongoDBConfig{
			URI:      getEnv("MONGODB_URI", "mongodb://localhost:27017"),
			Database: getEnv("MONGODB_DATABASE", "jurisconnect"),
			Timeout:  time.Second * 10,
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "your-secret-key"),
			Expiry: time.Hour * 24,
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
