from typing import Annotated
from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from backend.routes.authentication import auth_router
from backend.routes.assignments_management import assignment_router
from backend.routes.feedback_form import feedback_form_router
from backend.routes.student_feedback_retrieval import student_router
from backend.routes.marker_feedback_retrieval import marker_router
from backend.routes.mo_feedback_retrieval import module_organizer_router

app = FastAPI()
app.include_router(auth_router)
app.include_router(feedback_form_router)
app.include_router(assignment_router)
app.include_router(student_router)
app.include_router(marker_router)
app.include_router(module_organizer_router)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.get("/items/")
async def read_items(token: Annotated[str, Depends(oauth2_scheme)]):
    return {"token": token}

app.mount("/static", StaticFiles(directory="static"), name="static")