from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from random_word import RandomWords

def generate_random_text():
    rw = RandomWords()
    generated_text = []
    for i in range(10):
        generated_text.append(rw.get_random_word())

    return generated_text


app = Flask(name)
socketio = SocketIO(app, cors_allowed_origins="*")

connected_clients = set()

@socketio.on('connect')
def handle_connect():
    client_id = request.sid
    connected_clients.add(client_id)
    emit('client_connected', {'client_id': client_id})

@socketio.on('disconnect')
def handle_disconnect():
    client_id = request.sid
    connected_clients.remove(client_id)
    emit('client_disconnected', {'client_id': client_id}, broadcast=True)

@socketio.on('get_random_text')
def handle_get_random_text():
    random_text = generate_random_text()
    emit('random_text_generated', {'text': ' '.join(random_text)})

if name == 'main':
    socketio.run(app, port=5000)