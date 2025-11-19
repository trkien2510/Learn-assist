from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os

mongodb_uri = os.getenv("MONGODB_URI")
client = MongoClient(mongodb_uri, server_api=ServerApi('1'))
db = client["LearnAssist"]
user_collection = db["Users"]
documents_collection = db["Documents"]
questions_collection = db["Questions"]
test_collection = db["Test"]
result_collection = db["Result"]
statistics_collection = db["Statistics"]