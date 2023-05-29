from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

connected_clients = set()

@socketio.on('connect')
def handle_connect():
    client_id = request.sid
    connected_clients.add(client_id)
    emit('client_connected', {'client_id': client_id})

@socketio.on('disconnect')
def handle_disconnect():
    print('Disconnected')

@socketio.on('get_random_text')
def handle_get_random_text():
    print('Random text')

if __name__ == 'main':
    socketio.run(app, port=5000)