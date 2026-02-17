from flask import Flask
from src.security.security import add_security_headers


def create_app() -> Flask:
    app = Flask(__name__)
    app.after_request(add_security_headers)
    return app


