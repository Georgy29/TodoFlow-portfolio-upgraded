up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f api

psql:
	docker compose exec db psql -U pingpong -d pingpong

tables:
	docker compose exec db psql -U pingpong -d pingpong -c "\\dt"
