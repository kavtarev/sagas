FROM golang:1.23.0-alpine as build

WORKDIR /app

COPY . .

RUN go mod download

ENV DB_USER=postgres

ENV DB_PASSWORD=postgres

ENV DB_NAME=go_saga

ENV DB_PORT=5433

RUN go build -o go_saga .


FROM alpine:3

COPY --from=build app/go_saga .

CMD [ "./go_saga" ]