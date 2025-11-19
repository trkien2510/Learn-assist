from fastapi import FastAPI, APIRouter
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
mongodb_uri = os.getenv("MONGODB_URI")

app = FastAPI()
client = MongoClient(mongodb_uri, server_api=ServerApi('1'))
db = client["LearnAssist"]
documents_collection = db["Documents"]
user_collection = db["Users"]

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/ping")
def ping():
    try:
        result = client.admin.command("ping")
        return {"status": "connected", "result": result}
    except Exception as e:
        return {"error": str(e)}


@app.get("/collections")
def list_collections():
    cols = db.list_collection_names()
    return {"collections": cols}

@app.post("/add_user")
def add_item(user: User):
    result = user_collection.insert_one(user.model_dump())
    return {"inserted_id": str(result.inserted_id)}

@app.get("/all")
def get_all():
    items = []
    for doc in user_collection.find():
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return {"user": items}

@app.delete("/delete-all")
async def delete_all():
    documents_collection.delete_many({})
    user_collection.delete_many({})
    return {"deleted all"}
