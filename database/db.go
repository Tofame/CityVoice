package database

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"log"

	"CityVoice/models"
)

var DB *gorm.DB

func Connect() {
	dsn := "root:@tcp(127.0.0.1:3306)/cityvoice?charset=utf8mb4&parseTime=True&loc=Local"
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	DB = database

	// Auto-create tables based on models
	DB.AutoMigrate(&models.User{})
	DB.AutoMigrate(&models.Newsletter{})
}
