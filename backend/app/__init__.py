from flask import Flask
from pymongo import MongoClient

def create_app():
    app = Flask(__name__)

    client = MongoClient("mongodb://localhost:27017/")
    db = client["rentease"]

    app.config["DB"] = db

    return app