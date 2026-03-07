# Campus Connect Portal - Backend

This is the FastAPI backend for the Campus Connect Portal, using an in-memory mock database based on the Frontend's OpenAPI specification.

## Prerequisites
Dependencies are managed via `uv`. 

To install the dependencies:
```bash
uv sync
```

## Running the Server

To start the development server with live-reloading enabled, run:

```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 3000
```
*Alternatively, you can just run `uv run python main.py`*

Once running, you can view the interactive API documentation at:
- **Swagger UI:** [http://localhost:3000/docs](http://localhost:3000/docs)
- **ReDoc:** [http://localhost:3000/redoc](http://localhost:3000/redoc)

## Testing
To run the automated integration tests:
```bash
uv run pytest
```
