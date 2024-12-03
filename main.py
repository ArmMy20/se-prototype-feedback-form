from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from backend.routes.authentication import auth_router

app = FastAPI()
app.include_router(auth_router)

# @app.get("/")
# async def read_root():
#     return {"Hello": "World"}

app.mount("/static", StaticFiles(directory="static"), name="static")