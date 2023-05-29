from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import openai

openai.api_key = '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'

def generate_random_text():
    prompt = "Once upon a time"
    response = openai.Completion.create(
        engine='text-davinci-003',
        prompt=prompt,
        max_tokens=50,
        temperature=0.7
    )
    generated_text = response.choices[0].text.strip()
    return generated_text


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
    client_id = request.sid
    connected_clients.remove(client_id)
    emit('client_disconnected', {'client_id': client_id}, broadcast=True)

@socketio.on('get_random_text')
def handle_get_random_text():
    random_text = generate_random_text()
    emit('random_text_generated', {'text': random_text})
if __name__ == 'main':
    socketio.run(app, port=5000)