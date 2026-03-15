.PHONY: run test install

# Install dependencies using uv
install:
	uv sync

# Run the FastAPI development server
run:
	uv run uvicorn main:app --reload --host 0.0.0.0 --port 3000

# Run integration tests
test:
	uv run pytest
