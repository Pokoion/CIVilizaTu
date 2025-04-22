from flask import Flask
from flask_mongoengine import MongoEngine
from flask_jwt_extended import JWTManager
from routes.auth import auth_bp

app = Flask(__name__)

# MongoDB configuration
app.config['MONGODB_SETTINGS'] = {
    'db': 'civilizatu',
    'host': 'localhost',
    'port': 27017
}
db = MongoEngine(app)

# JWT configuration
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret'
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    app.run(port=5000)
