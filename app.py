from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import random
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///words.db'
db = SQLAlchemy(app)

class Word(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(50), nullable=False)
    length = db.Column(db.Integer, nullable=False)

# Sample word lists
three_letter_words = ['cat', 'dog', 'bat', 'hat', 'rat', 'mat', 'sat', 'pat', 'fat', 'map', 
                     'cap', 'tap', 'nap', 'bag', 'tag', 'rag', 'pig', 'dig', 'big', 'wig']
four_letter_words = ['book', 'look', 'took', 'cook', 'hook', 'door', 'poor', 'food', 'good',
                    'wood', 'rain', 'pain', 'main', 'gain', 'park', 'dark', 'mark', 'bark']
five_letter_words = ['apple', 'table', 'chair', 'house', 'mouse', 'green', 'black', 'white',
                    'happy', 'smile', 'dance', 'plant', 'water', 'light', 'bread', 'sleep']

@app.before_first_request
def create_tables():
    db.create_all()
    # Add words if database is empty
    if not Word.query.first():
        for word in three_letter_words:
            db.session.add(Word(word=word, length=3))
        for word in four_letter_words:
            db.session.add(Word(word=word, length=4))
        for word in five_letter_words:
            db.session.add(Word(word=word, length=5))
        db.session.commit()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_words/<int:length>')
def get_words(length):
    words = Word.query.filter_by(length=length).all()
    selected_words = random.sample([w.word for w in words], 10)
    return jsonify(selected_words)

if __name__ == '__main__':
    app.run(debug=True)
