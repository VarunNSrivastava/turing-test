import {useCallback, useEffect, useRef, useState} from 'react';
import './App.css'


import {generate_questions} from "./questions.js";

import alBert from './assets/alBert.gif';
import character2 from './assets/character2.png';
import nullpointered from './assets/nullpointered.gif';

import podium from './assets/podium.png';
import loadModels from "./models.js";

import {getMostSimilarOption, answerQuestion} from "./models.js";

function App() {
    const [modelsLoaded, setModelsLoaded] = useState(false);

    useEffect(() => {
        const fetchModels = async () => {
            await loadModels();
            setModelsLoaded(true);
        };

        fetchModels();
    }, []);

    useEffect(() => {
        if (modelsLoaded && gamePhase === 0) {
            setGamePhase(1);
        }
    }, [modelsLoaded]);

    const [gameEnded, setGameEnded] = useState(false);
    const [roundNumber, setRoundNumber] = useState(0);
    const [welcomeMessage, setWelcomeMessage] = useState(0);

    const NUMBER_ROUNDS = 10;


    let [gamePhase, setGamePhase] = useState(0);
    let [correctAnswer, setCorrectAnswer] = useState('A');
    let [wasCorrect, setWasCorrect] = useState(false);

    // Your array of welcome messages
    const WELCOME_MESSAGES = ["Welcome to ARE YOU SMARTER THAN A LANGUAGE MODEL!",
        "You are playing against 2 language models for 10 rounds of trivia.",
        "Don't worry, they're not that good."];

    const QUIPS = [
        ">:‑)",
        "That one was a doozy",
        "XD",
        ":3",
        "(>_<)",
        "<(｀^´)>",
        "('_')",
        "( ^^)",
        "Take your time.",
        "Did you know 'G' is the most searched letter on Wikipedia?",
        "Breathe. Focus.",
        "Remember, p(x,y) = p(x|y)p(y).",
        "My name is G. P. Trebek btw. no relation",
        "A robot wrote these. I promise. Beep Boop Beep...",
        "Roses are red, violets are blue, these questions are tough, how about you?",
        "Error 404: Funny quip not found",
        "If only I could ask you about the meaning of life...",
        "Did I tell you about the time I calculated pi to 3.14?",
        "Don't worry, I won't hold it against you if you get this wrong",
        "You've got this! I believe in you... as much as a language model can",
        "Don't be scared. It's not like I'm judging you.",
        "At the end of the game, do I get a turn to answer questions?",
        "Remember, it's not about the destination. It's about the journey. And the questions.",
        "Don't blame me. I didn't write these."
    ]

    const GAME_PHASES = ["Loading", "Welcome", "Question", "Quip", "Scoring", "Finished"]

    // welcome messages
    useEffect(() => {
        if (gamePhase === 1) {
            if (welcomeMessage < WELCOME_MESSAGES.length) {
                const timer = setTimeout(() => {
                    setWelcomeMessage(welcomeMessage + 1);
                }, 2500);
                return () => clearTimeout(timer);
            } else {
                setGamePhase(2);
            }
        }
    }, [gamePhase, welcomeMessage]);

    const [questions, setQuestions] = useState([]);

    // generate questions
    useEffect(() => {
        async function fetchQuestions() {
            const result = await generate_questions(NUMBER_ROUNDS);
            setQuestions(result);
        }

        fetchQuestions();
    }, []);

    // useEffect( () => {console.log(gamePhase)}, [gamePhase]);

    const [answer1, setAnswer1] = useState("");
    const [answer2, setAnswer2] = useState("");
    const [answer3, setAnswer3] = useState("");

    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);
    const [score3, setScore3] = useState(0);


    const [currentQuestion, setCurrentQuestion] = useState("This is your question");
    const [currentChoices, setCurrentChoices] = useState([
        {id: 'A', text: 'Choice A'},
        {id: 'B', text: 'Choice B'},
        {id: 'C', text: 'Choice C'},
        {id: 'D', text: 'Choice D'},
        {id: 'E', text: 'Choice E'},
    ]);

    function loadNewQuestion() {
        const [questionText, correctAnswerIndex, ...answerChoicesText] = questions[roundNumber];

        setCurrentQuestion(questionText);

        const newChoices = answerChoicesText.map((choiceText, index) => {
            return {
                id: String.fromCharCode(65 + index),  // 65 is the ASCII value for 'A'
                text: choiceText
            };
        });

        setCurrentChoices(newChoices);
        setCorrectAnswer(String.fromCharCode(65 + correctAnswerIndex));
        setAnswer1("");
        setAnswer3("");
    }


    // Call loadNewQuestion whenever roundNumber changes
    useEffect(() => {
        if (questions.length > 0 && roundNumber < NUMBER_ROUNDS) {
            loadNewQuestion();
        }
    }, [questions, roundNumber]);

    useEffect(() => {
        if (roundNumber === NUMBER_ROUNDS) {
            setGamePhase(5);
        }
    }, [roundNumber])

    useEffect(() => {
        async function performAnswerQuestion() {
            try {
                let result = await getMostSimilarOption(currentQuestion, currentChoices);
                setAnswer1(String.fromCharCode(65 + result));
            } catch(error) {
                console.error(error);
            }
        }
        if (gamePhase === 2 && answer3 === "") {
            performAnswerQuestion();
        }
    }, [gamePhase, currentQuestion, currentChoices, answer1])


    useEffect(() => {
        async function performAnswerQuestion() {
            let context = `${currentQuestion}\n${currentChoices.map(choice => `${choice.id}. ${choice.text}`).join('\n')}`;
            const curQuestion = "A, B, C, D, or E?";
            try {
                let result = await answerQuestion(curQuestion, context);
                setAnswer3(result);
            } catch(error) {
                console.error(error);
            }
        }

        if (gamePhase === 2 && answer3 === "") {
            performAnswerQuestion();
        }
    }, [gamePhase, currentQuestion, currentChoices, answer3])

    const handleChoiceClick = (choiceId) => {
        // your choice handling logic here
        console.log("bot 1 answer", answer1);
        console.log("bot 3 answer", answer3);
        setWasCorrect(choiceId === correctAnswer);
        setAnswer2(choiceId);

        // then call all your useState hooks
        setGamePhase(3); // quip :)

        setTimeout(() => {

            setGamePhase(4); // correct answer

            setTimeout(() => {
                setGamePhase(2); // back to questions
                setRoundNumber(roundNumber + 1);

                // update the scores based on their answers
                if(answer1 === correctAnswer) {
                    setScore1(score1 + 100);
                }
                if(choiceId === correctAnswer) {
                    setScore2(score2 + 100);
                }
                if(answer3 === correctAnswer) {
                    setScore3(score3 + 100);
                }

            }, 2000);

        }, 2000);
    };



    return (
        <div className="page-container">

            <div className="app-wrapper">

                <div className="questions">
                    {gamePhase === 0 ? <h1>Loading...</h1> :
                        gamePhase === 1 ? WELCOME_MESSAGES[welcomeMessage] :
                            gamePhase === 2 ? <h2>Question {roundNumber + 1}: {currentQuestion}</h2> :
                                gamePhase === 3 ? <h1>{
                                        roundNumber === NUMBER_ROUNDS - 2
                                            ? "Next question is the last!"
                                            : QUIPS[Math.floor(Math.random() * QUIPS.length)]
                                    }</h1> :
                                    gamePhase === 4 ? <h2>You
                                            were {wasCorrect ? 'correct, the answer was ' + correctAnswer : 'incorrect. The correct answer was ' + correctAnswer}.</h2> :
                                        "Game Over! You won! Refresh to play again."
                    }
                    {gamePhase === 2 && currentChoices.map((choice) => (
                        <div className="button" key={choice.id}>
                            <button onClick={() => handleChoiceClick(choice.id)}>
                                {`${choice.id}. ${choice.text}`}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="character-container">
                    {/*character 1*/}
                    <div className="character">
                        <div className="character-image-container">

                            <img className="character-image" src={nullpointered} alt="Character 2"/>
                        </div>
                        <div className="overlay-container">
                            <img className="overlay-image" src={podium} alt="Overlay"/>
                            <div className="name-text">Null Pr0cessor</div>
                            <div className="score-text">
                                {
                                    gamePhase === 3 ? `Selected: ${answer1}` :
                                        gamePhase === 4 ? `Selected: ${answer1}` :
                                            `Score: ${score1}`
                                }
                            </div>
                        </div>

                    </div>

                    {/*character 2*/}
                    <div className="character">
                        <div className="character-image-container">

                            <img className="character-image" src={character2} alt="Character 2"/>
                        </div>
                        <div className="overlay-container">
                            <img className="overlay-image" src={podium} alt="Overlay"/>
                            <div className="name-text">You</div>
                            <div className="score-text">
                                {
                                    gamePhase === 3 ? `Selected: ${answer2}` :
                                        gamePhase === 4 ? `Selected: ${answer2}` :
                                            `Score: ${score2}`
                                }
                            </div>
                        </div>

                    </div>

                    {/*character 3*/}
                    <div className="character">
                        <div className="character-image-container">

                            <img className="character-image" src={alBert} alt="Character 2"/>
                        </div>
                        <div className="overlay-container">
                            <img className="overlay-image" src={podium} alt="Overlay"/>
                            <div className="name-text">alBert</div>
                            <div className="score-text">
                                {
                                    gamePhase === 3 ? `Selected: ${answer3}` :
                                        gamePhase === 4 ? `Selected: ${answer3}` :
                                            `Score: ${score3}`
                                }
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <div className="text-container">
                <p>this game was made by Varun Srivastava<br></br>
                    for the <a href="https://itch.io/jam/open-source-ai-game-jam">🤗Open Source AI Game Jam.</a><br></br>
                    It's built on <a href="https://huggingface.co/docs/transformers.js/index">xenova's transformers.js</a>,<br></br>
                    using language models <a href="https://huggingface.co/Xenova/distilbert-base-cased-distilled-squad">distilbert-base-cased-distilled-squad</a> and
                    <a href="https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2">all-MiniLM-L6-v2</a>. <br></br>
                        Trivia taken from the <a href="https://huggingface.co/datasets/metaeval/cycic_multiplechoice">metaeval/cycic_multiplechoice</a> dataset <br></br>
                    <br></br>
                    <a href="https://github.com/VarunNSrivastava/turing-test">Code available here.</a>
                    <br></br>
                    <br></br>

                    ... trivia expands your mind. :)


                </p>
            </div>
        </div>

    );
}

export default App
