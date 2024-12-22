package main

import (
	"fmt"
	"net/http"
)

type Server struct {
	port int
	db   Storage
}

func NewServer(port int, s Storage) *Server {
	return &Server{port: port, db: s}
}

func (s *Server) start() error {
	mux := http.NewServeMux()
	mux.HandleFunc("/", s.handle)

	return http.ListenAndServe(fmt.Sprintf(":%v", s.port), mux)

}

func (s *Server) handle(w http.ResponseWriter, r *http.Request) {
	// s.db.save()

	w.Header().Add("some", "body")
	w.WriteHeader(404)
	w.Write([]byte("dove"))
}
