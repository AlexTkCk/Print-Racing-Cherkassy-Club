from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from random_word import RandomWords

def generate_random_text():
    rw = RandomWords()
    generated_text = []
    for i in range(10):
        generated_text.append(rw.get_random_word())

    return generated_text


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
connected_clients = set()
rooms_data = {}


@socketio.on('connect_to_client')
def handle_connect_to_client(connectid):
    room = connectid
    if room not in connected_clients:
        return emit('room_not_found', {'room_id': connectid})

    join_room(room)
    if room not in rooms_data:
        rooms_data[room] = []  # Создание списка для каждой комнаты
    text = generate_random_text()
    rooms_data[room].append(text)
    emit('connected_to_client', {'room_id': connectid})


@socketio.on('disconnect_from_client')
def handle_disconnect_from_client():
    client_id = request.sid
    leave_room(client_id)
    emit('disconnected_from_client', {'client_id': client_id})


@socketio.on('connect')
def handle_connect():
    client_id = request.sid
    room = client_id
    connected_clients.add(client_id)
    join_room(room)
    if room not in rooms_data:
        rooms_data[room] = []  # Создание списка для каждой комнаты
    text = generate_random_text()
    rooms_data[room].append(text)
    emit('client_connected', {'client_id': client_id})


@socketio.on('disconnect')
def handle_disconnect():
    client_id = request.sid
    connected_clients.remove(client_id)
    leave_room(client_id)
    emit('client_disconnected', {'client_id': client_id}, broadcast=True)


@socketio.on('get_random_text')
def handle_get_random_text():
    random_text = generate_random_text()
    emit('random_text_generated', {'text': ' '.join(random_text)})

@socketio.on('check_text')
def handle_check_text(data):
    room = data['room']
    entered_text = data['text']
    generated_text = rooms_data.get(room)

    if generated_text is None:
        return emit('check_text_result', {'status': 400})

    if len(entered_text) != len(generated_text):
        return emit('check_text_result', {'status': 400})

    for entered_char, generated_char in zip(entered_text, generated_text):
        if entered_char != generated_char:
            return emit('check_text_result', {'status': 400})

    return emit('check_text_result', {'status': 200})


if __name__ == '__main__':
    socketio.run(app, port=5000)
