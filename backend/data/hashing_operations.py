import json
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Original data
data = [
    {"user_id": "MO100",
        "role": "Module Organiser", "username": "MOtest", "password": "mo123"},
    {"user_id": "MO101",
        "role": "Module Organiser",
        "username": "MOtest2", "password": "mo223"},
    {"user_id": "MK100",
        "role": "Marker", "username": "MKtest", "password": "mk123"},
    {"user_id": "MK101",
        "role": "Marker", "username": "MK2test", "password": "mk223"},
    {"user_id": "ST100",
        "role": "Student", "username": "STtest", "password": "st123"},
    {"user_id": "ST101",
        "role": "Student", "username": "ST1test", "password": "st223"},
    {"user_id": "ST102",
        "role": "Student", "username": "ST2test", "password": "st323"},
]

# Hash passwords
for user in data:
    user["password"] = pwd_context.hash(user["password"])

# Save to JSON file
with open("backend/data/user-accounts.json", "w") as f:
    json.dump(data, f, indent=4)
