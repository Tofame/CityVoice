package utils

import (
	"CityVoice/models"
	"crypto/rand"
	"encoding/hex"
	"github.com/golang-jwt/jwt/v5"
	"log"
	"os"
	"time"
)

var JwtKey []byte

func LoadJwtKey() {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("JWT_SECRET environment variable is not set")
	}
	JwtKey = []byte(secret)
}

func GenerateJWT(userID uint, access models.AccessLevel) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(1 * time.Hour).Unix(), // expiration of the token, 1h should be enough
	})
	return token.SignedString(JwtKey)
}

func GenerateRandomSecret() string {
	bytes := make([]byte, 32) // 32 bytes = 256 bits
	_, err := rand.Read(bytes)
	if err != nil {
		log.Fatalf("Failed to generate random secret: %v", err)
	}
	return hex.EncodeToString(bytes)
}
