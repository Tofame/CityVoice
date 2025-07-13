package utils

import (
	"CityVoice/models"
	"github.com/golang-jwt/jwt/v5"
	"time"
)

var JwtKey = []byte("a8f3d9e2c7b4f1a5d6e8c0b9f2a3d4e7") // unsafe btw, we should be getting it from env, but it's a test app anyway.

func GenerateJWT(userID uint, access models.AccessLevel) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"access":  access,
		"exp":     time.Now().Add(1 * time.Hour).Unix(), // expiration of the token, 1h should be enough
	})
	return token.SignedString(JwtKey)
}
