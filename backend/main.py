from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routes import auth, students, payments, settings, notifications

app = FastAPI(title="Campus Connect Portal API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(payments.router, prefix="/api/students", tags=["Payments"]) # Notice students prefix to match /students/{id}/payments
app.include_router(settings.router, prefix="/api", tags=["Settings", "Tuition"]) # Mixed prefix in OpenAPI spec
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

def main():
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True)

if __name__ == "__main__":
    main()
