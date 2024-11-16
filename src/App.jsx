import { useState, useEffect } from 'react'
import './App.css'

// Word lists for different categories
const wordLists = {
  three: ['cat', 'dog', 'bat', 'hat', 'rat', 'mat', 'sat', 'pat', 'fat', 'map', 
          'cap', 'tap', 'nap', 'bag', 'tag', 'rag', 'pig', 'dig', 'big', 'wig'],
  four: ['book', 'look', 'took', 'cook', 'hook', 'door', 'poor', 'food', 'good',
         'wood', 'rain', 'pain', 'main', 'gain', 'park', 'dark', 'mark', 'bark'],
  five: ['apple', 'table', 'chair', 'house', 'mouse', 'green', 'black', 'white',
         'happy', 'smile', 'dance', 'plant', 'water', 'light', 'bread', 'sleep']
}

function App() {
  const [gameState, setGameState] = useState('menu')
  const [currentWords, setCurrentWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [currentInput, setCurrentInput] = useState('')
  const [score, setScore] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices when they're ready
      speechSynthesis.onvoiceschanged = () => {
        const voices = speechSynthesis.getVoices()
        console.log('Voices loaded:', voices.length)
      }
    }
  }, [])

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel()

      const voices = speechSynthesis.getVoices()
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en-') && !voice.name.includes('Microsoft')
      )

      // Function to speak text with a promise
      const speak = (text, rate = 0.9) => {
        return new Promise((resolve) => {
          const utterance = new SpeechSynthesisUtterance(text)
          if (englishVoice) {
            utterance.voice = englishVoice
          }
          utterance.rate = rate
          utterance.pitch = 1
          utterance.onend = resolve
          speechSynthesis.speak(utterance)
        })
      }

      // Start the speaking process
      setIsSpeaking(true)
      
      // Speak each letter with a slight pause
      const speakLetters = async () => {
        for (let letter of word.split('')) {
          await speak(letter, 0.8)
          // Small pause between letters
          await new Promise(resolve => setTimeout(resolve, 300))
        }
        // Small pause before speaking the whole word
        await new Promise(resolve => setTimeout(resolve, 500))
        // Speak the complete word
        await speak(word)
        setIsSpeaking(false)
      }

      speakLetters()
    }
  }

  const startQuiz = (wordLength) => {
    const selectedWords = [...wordLists[wordLength]]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
    
    setCurrentWords(selectedWords)
    setCurrentIndex(0)
    setUserAnswers([])
    setScore(0)
    setGameState('playing')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const isCorrect = currentInput.toLowerCase().trim() === currentWords[currentIndex].toLowerCase()
    if (isCorrect) setScore(score + 1)
    
    setUserAnswers([...userAnswers, {
      word: currentWords[currentIndex],
      userAnswer: currentInput,
      correct: isCorrect
    }])
    
    if (currentIndex < 9) {
      setCurrentIndex(currentIndex + 1)
      setCurrentInput('')
    } else {
      setGameState('results')
    }
  }

  const resetQuiz = () => {
    setGameState('menu')
    setCurrentInput('')
    speechSynthesis.cancel() // Cancel any ongoing speech
  }

  return (
    <div className="app-container">
      <h1 className="title">🌟 Learn Reading for Kids 🌟</h1>

      {gameState === 'menu' && (
        <div className="menu">
          <h2>Choose Your Level:</h2>
          <div className="button-group">
            <button onClick={() => startQuiz('three')} className="btn primary">
              3 Letter Words
            </button>
            <button onClick={() => startQuiz('four')} className="btn success">
              4 Letter Words
            </button>
            <button onClick={() => startQuiz('five')} className="btn warning">
              5 Letter Words
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="quiz-container">
          <h3>Question {currentIndex + 1}/10</h3>
          <div className="word-display">
            {currentWords[currentIndex]}
            <button 
              onClick={() => speakWord(currentWords[currentIndex])}
              className="btn speak-btn"
              disabled={isSpeaking}
            >
              🔊 {isSpeaking ? 'Speaking...' : 'Hear Word'}
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type the word here..."
              autoFocus
            />
            <button type="submit" className="btn primary">
              Submit
            </button>
          </form>
        </div>
      )}

      {gameState === 'results' && (
        <div className="results">
          <h2>Quiz Complete! 🎉</h2>
          <h3>Your Score: {score}/10</h3>
          <div className="answers-list">
            {userAnswers.map((answer, index) => (
              <div 
                key={index} 
                className={`answer ${answer.correct ? 'correct' : 'incorrect'}`}
              >
                <div className="answer-content">
                  <span>Question {index + 1}: {answer.word}</span>
                  <button 
                    onClick={() => speakWord(answer.word)}
                    className="btn speak-btn-small"
                    disabled={isSpeaking}
                  >
                    🔊
                  </button>
                  {answer.correct ? 
                    <span>✓</span> : 
                    <span>✗ (You wrote: {answer.userAnswer})</span>
                  }
                </div>
              </div>
            ))}
          </div>
          <button onClick={resetQuiz} className="btn primary">
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

export default App
