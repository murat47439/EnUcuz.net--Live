package config

import (
	"log"
	"os"
)

type Log struct {
	Log *log.Logger
}

func NewLog(log *log.Logger) *Log {
	return &Log{
		Log: log,
	}
}

var Logger *log.Logger

func (l *Log) InitLogger() {

	if _, err := os.Stat("logs"); os.IsNotExist(err) {
		os.Mkdir("logs", 0755)
	}
	file, err := os.OpenFile("logs/app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal("Log dosyası açıılamadı", err)
	}
	Logger = log.New(file, "APP_LOG: ", log.Ldate|log.Ltime|log.Lshortfile)
	l.Log = Logger
}
