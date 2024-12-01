from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# @app.get("/")
# async def read_root():
#     return {"Hello": "World"}

app.mount("/static", StaticFiles(directory="static"), name="static")