import {useCallback, useEffect, useRef, useState} from 'react';
import './App.css'
import SketchCanvas from './components/SketchCanvas'
import constants from './constants'
import Menu from './components/Menu';
import GameOver from './components/GameOver';
import Countdown from './components/Countdown';
import TodoComponent from "./components/TextPrompt.jsx";

import {AnimatePresence} from 'framer-motion'


import {generate_questions} from "./questions.js";


function App() {
    const [answer1, setAnswer1] = useState('');
    const [answer2, setAnswer2] = useState('');
    const [answer3, setAnswer3] = useState('');
    const [answer4, setAnswer4] = useState('');

    const [gameEnded, setGameEnded] = useState(false);
    const [roundNumber, setRoundNumber] = useState(0);
    const [currentMessage, setCurrentMessage] = useState(0);

    const NUMBER_ROUNDS = 10;

    const [allowAnswer, setAllowAnswer] = useState(true); // or false, depending on the initial condition

    let [gamePhase, setGamePhase] = useState(0);

    // Your array of welcome messages
    const WELCOME_MESSAGES = ["Welcome to ARE YOU SMARTER THAN A LANGUAGE MODEL",
        "You are playing 3 robots for 10 rounds of trivia.",
    "Don't worry, they're not that good."];

    const GAME_PHASES = ["Loading", "Welcome", "Question", "Quip", "Scoring", "GameOver"]

    // welcome messages
    useEffect(() => {
        setGamePhase(1);
        if (currentMessage < WELCOME_MESSAGES.length) {
            const timer = setTimeout(() => {
                setCurrentMessage(currentMessage + 1);
            }, 200);
            return () => clearTimeout(timer);
        } else {
            console.log("when does this getr triggered?")
            setGamePhase(2);
        }
    }, [currentMessage]);

    const [questions, setQuestions] = useState([]);

    // generate questions
    useEffect(() => {
        async function fetchQuestions() {
            const result = await generate_questions(NUMBER_ROUNDS);
            console.log(result);
            setQuestions(result);
            console.log(questions);
        }

        fetchQuestions();
    }, []);



    const handleKeyUp = (e) => {
        if (e.key === "Enter") {
            setAnswer2("");
            console.log(e.target.value);
            if (roundNumber < NUMBER_ROUNDS - 1) {
                setRoundNumber(roundNumber + 1);
            } else {
                setGameEnded(true);
            }
        }
    };

    const [currentQuestion, setCurrentQuestion] = useState("This is your question");
    const [currentChoices, setCurrentChoices] = useState([
        { id: 'A', text: 'Choice A'},
        { id: 'B', text: 'Choice B'},
        { id: 'C', text: 'Choice C'},
        { id: 'D', text: 'Choice D'},
        { id: 'E', text: 'Choice E'},
    ]);

    function loadNewQuestion() {
        const [questionText, correctAnswerIndex, ...answerChoicesText] = questions[roundNumber];

        // Update the current question
        setCurrentQuestion(questionText);

        // Map the answer choice text to objects with id and text properties
        // The id will be A, B, C, D, or E, corresponding to the index of the choice
        const newChoices = answerChoicesText.map((choiceText, index) => {
            return {
                id: String.fromCharCode(65 + index),  // 65 is the ASCII value for 'A'
                text: choiceText
            };
        });

        // Update the current choices
        setCurrentChoices(newChoices);
    }


// Call loadNewQuestion whenever roundNumber changes
    useEffect(() => {
        if (questions.length > 0) {
            loadNewQuestion();
        }
    }, [questions, roundNumber]);

    const [userAnswer, setUserAnswer] = useState('');



    return (
        <>
            <h1 className="header">{gameEnded ? "Game Over!" : currentMessage < WELCOME_MESSAGES.length ? WELCOME_MESSAGES[currentMessage] : questions[roundNumber]}</h1>

            {(gamePhase === 2) && (
                <div className="question">
                    <h2>{currentQuestion}</h2>
                    {currentChoices.map((choice) => (
                        <div key={choice.id}>
                            <button onClick={() => handleChoiceClick(choice.id)}>
                                {`${choice.id}. ${choice.text}`}
                            </button>
                        </div>
                    ))}
                </div>
            )}


            <div className="container">
                <div className="text-box-container">
                    <input id="box1" className="text-box" type="text" value={answer1}
                           onChange={(e) => setAnswer1(e.target.value)}
                           onKeyUp={handleKeyUp} disabled/>
                    <label htmlFor="box1">G. P. Ted</label>
                </div>
                <div className="text-box-container">
                    <input id="box2" className="text-box" type="text" value={answer2}
                           onChange={(e) =>
                               setAnswer2(userAnswer)} onKeyUp={handleKeyUp}  disabled/>
                    <label htmlFor="box2">You</label>
                </div>
                <div className="text-box-container">
                    <input id="box3" className="text-box" type="text" value={answer3}
                           onChange={(e) => setAnswer3(e.target.value)} onKeyUp={handleKeyUp} disabled/>
                    <label htmlFor="box3">Blue</label>
                </div>
                <div className="text-box-container">
                    <input id="box4" className="text-box" type="text" value={answer4}
                           onChange={(e) => setAnswer4(e.target.value)} onKeyUp={handleKeyUp} disabled/>
                    <label htmlFor="box4">Bert</label>
                </div>
            </div>

        </>
    );
}

export default App
