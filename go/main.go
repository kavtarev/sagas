package main

func main() {

	// storage, err := NewDbStorage()
	// if err != nil {
	// 	panic(err)
	// }
	// storage.init()

	server := NewServer(3000, nil)
	err := server.start()
	if err != nil {
		panic(err)
	}
}
