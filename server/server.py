from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from random_word import RandomWords
import time

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
rooms = {}

@socketio.on('connect_to_client')
def handle_connect_to_client(data):
    user_is_connecting = request.sid
    user_connected_to = data['connectID']
    if user_connected_to not in connected_clients:
        emit('connecting_unsuccessful')
        return

    emit('new_game_request', {'id': user_is_connecting}, to=user_connected_to)



@socketio.on('request_accepted')
def handle_request_accepted(data):
    user_is_connecting = request.sid
    user_connected_to = data['connectID']

    room = {
            'client_1': user_is_connecting,
            'client_2': user_connected_to,
            'timer': 30,
            'text': generate_random_text(),
            'client_1_position': 0,
            'client_2_position': 0,
            'roomID': user_connected_to
    }

    emit('connecting_successful', room, to=user_is_connecting)
    emit('connecting_successful', room, to=user_connected_to)
    rooms[user_connected_to] = room

    while rooms[user_connected_to]['timer'] > 0:
            time.sleep(1)
            rooms[user_connected_to]['timer'] -= 1
            emit('timer_update', room['timer'], to=rooms[user_connected_to]['client_1'])
            emit('timer_update', room['timer'], to=rooms[user_connected_to]['client_2'])


@socketio.on('disconnect_from_client')
def handle_disconnect_from_client():
    client_id = request.sid
    leave_room(client_id)
    emit('disconnected_from_client', {'client_id': client_id})


@socketio.on('connect')
def handle_connect():
    client_id = request.sid
    room = client_id
    emit('client_connected', {'client_id': client_id})
    connected_clients.add(client_id)
    join_room(room)
    if room not in rooms_data:
        rooms_data[room] = []  # Создание списка для каждой комнаты
    text = generate_random_text()
    rooms_data[room].append(text)


@socketio.on('disconnect')
def handle_disconnect():
    client_id = request.sid
    connected_clients.remove(client_id)
    leave_room(client_id)
    emit('client_disconnected', {'client_id': client_id}, broadcast=True)


@socketio.on('check_text')
def handle_check_text(data):
    room = rooms[data['room']]
    key = data['key']
    generated_text = ' '.join(data['text'])
    client_id = request.sid

    if client_id == room['client_1']:
        if key == generated_text[room['client_1_position']]:
            emit('key_valid', {'key': key}, to=client_id)
        else :
            emit('key_wrong', {'key': key}, to=client_id)
        room['client_1_position'] += 1
    else :
        if key == generated_text[room['client_2_position']]:
            emit('key_valid', {'key': key}, to=client_id)
        else :
            emit('key_wrong', {'key': key}, to=client_id)
        room['client_2_position'] += 1



if __name__ == '__main__':
    socketio.run(app, port=5000)
