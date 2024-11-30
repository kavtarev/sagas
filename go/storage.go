package main

import (
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
	"math/rand"
	"os"
)

type Storage interface {
	save() error
}

type MockStorage struct{}

func (m *MockStorage) save() error {
	return nil
}

type DbStorage struct {
	db *sql.DB
}

func NewDbStorage() (*DbStorage, error) {
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	dbStr := fmt.Sprintf("postgres://%v:%v@127.0.0.1:%v/%v?sslmode=disable", user, pass, port, dbName)
	con, err := sql.Open("postgres", dbStr)
	if err != nil {
		return nil, err
	}

	err = con.Ping()
	if err != nil {
		return nil, err
	}

	return &DbStorage{db: con}, nil
}

func (s *DbStorage) init() {
	c, err := s.db.Query("create table if not exists logs (log text)")
	if err != nil {
		panic(err)
	}
	defer c.Close()
}

func (s *DbStorage) save() error {
	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	q, err := tx.Query("select now()")
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to execute query: %w", err)
	}
	defer q.Close()

	var r string
	for q.Next() {
		err := q.Scan(&r)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to scan result: %w", err)
		}
	}

	_, err = tx.Exec("insert into logs (log) values ($1)", r)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to insert into logs: %w", err)
	}

	randomInt := rand.Intn(101)
	if randomInt > 80 {
		tx.Rollback()
		return fmt.Errorf("not today: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	fmt.Println("Inserted log:", r)
	return nil
}
