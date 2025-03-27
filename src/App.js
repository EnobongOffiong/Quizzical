
import './App.css';
import React, { useState, useEffect } from 'react';

function App() {

  const [categories, setCategories] = useState([])
  const [gameStarted, setGameStarted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [questionNumber, setQuestionNumber] = useState("10")
  const [difficulty, setDifficulty] = useState("")
  const [questionType, setQuestionType] = useState("")
  const [correctAnswers, setcorrectAnswers] = useState([])
  const [selectedAnswers, setSelectedAnswers]= useState([])
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [firstClick, setFirstClick] = useState(true);
  const [questionsList , setQuestionsList] = useState([])
  const [isPlayAgainDisabled, setIsPlayAgainDisabled] = useState(false);
  const [noQuestions, setNoQuestions] = useState(false)
  const [isStartDisabled, setIsStartDisabled] = useState(false);
  const [playAgainCountdown, setPlayAgainCountdown] = useState(4);
  const [startCountdown, setStartCountdown] = useState(4);
  
  const answersArray = questionsList.map((question)=>(
      question.correct_answer
  ))

  const urlCategory = selectedCategory ? `&category=${selectedCategory}` : ""
  const urlDifficulty = difficulty ? `&difficulty=${difficulty}` : ""
  const urlType = questionType ? `&type=${questionType}` : ""
  
 const url = `https://opentdb.com/api.php?amount=${questionNumber}${urlCategory}${urlDifficulty}${urlType}`

 const SkeletonLoader = () => (
  <div className="skeleton-container">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="skeleton-question">
        <div className="skeleton-title"></div>
        <div className="skeleton-option"></div>
        <div className="skeleton-option"></div>
        <div className="skeleton-option"></div>
        <div className="skeleton-option"></div>
      </div>
    ))}
  </div>
)

  function decodeHTML(encodedString) {
    const parser = new DOMParser();
    const decodedString = parser.parseFromString(encodedString, "text/html").documentElement.textContent;
    return decodedString;
  }

  function compareAnswers(){ 
    let score = 0
    for(let i=0; i<correctAnswers.length-1; i++){
      if(correctAnswers[i]===selectedAnswers[i]){
        score+=1
      }
    }
    setScore(score)
    setIsSubmitted(true)
    setIsPlayAgainDisabled(true);

    setTimeout(() => {
        setIsPlayAgainDisabled(false);
    }, 4000);
      
  }

  function handleMenu() {
    setGameStarted(false);
    setIsSubmitted(false);
    setFirstClick(true);
    setIsPlayAgainDisabled(true);
    setIsStartDisabled(true);

    setTimeout(() => {
        setIsPlayAgainDisabled(false);
    }, 4000);

  }
  async function handlePlayAgain() {
    setIsPlayAgainDisabled(true);
  }

  function handleGameStarted(){
    if (firstClick) {
      setGameStarted(true);
      setFirstClick(false);
      setIsStartDisabled(true);
    }
    else{
      setLoading(true);

      setTimeout(() => {
        setGameStarted(true);
        setLoading(false);
      }, 3000);
    }

  
  
  }

  async function fetchData(){
    try{
      const response = await fetch('https://opentdb.com/api_category.php')
      const data = await response.json()
      const dataArray = data.trivia_categories
      setCategories(dataArray)
      
    }
    catch(error){
      console.error('Error fetching data:', error);
    }

   
  }

  async function getQuestions(link){
        try{
          setLoading(true);
          setQuestionsList([])
          const response = await fetch(link)
        const questions = await response.json()
        
        if(questions.response_code === 1){
          setNoQuestions(true)
        }
        else{
          setNoQuestions(false)
        }
        const questionsArray = questions.results.map((question) => {
          const answers = [
              { text: decodeHTML(question.correct_answer), isCorrect: true },
              ...question.incorrect_answers.map((answer) => ({
                  text: decodeHTML(answer),
                  isCorrect: false,
              })),
          ];

          const shuffledAnswers = answers.sort(() => Math.random() - 0.5);

          return {
              ...question,
              question: decodeHTML(question.question),
              correct_answer: decodeHTML(question.correct_answer),
              shuffledAnswers, 
          };
      });

        setQuestionsList(questionsArray);
        setSelectedAnswers(Array(questionsArray.length).fill(null)); 
        setScore(0)
        setIsSubmitted(false)
        
      }
      catch(error){
        console.error('Error fetching data:', error);
      } 
      finally{
        setTimeout(() => setLoading(false), 500);
      }
  }

  useEffect(() => {
    let timer;
    if (isPlayAgainDisabled) {
      setPlayAgainCountdown(4);
      timer = setInterval(() => {
        setPlayAgainCountdown((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
      setTimeout(() => {
        setIsPlayAgainDisabled(false);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isPlayAgainDisabled]);

  useEffect(() => {
    let timer;
    if (isStartDisabled) {
      setStartCountdown(4);
      timer = setInterval(() => {
        setStartCountdown((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
      setTimeout(() => {
        setIsStartDisabled(false);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isStartDisabled]);

  async function handlePlayAgain() {
      setIsPlayAgainDisabled(true); 
      await getQuestions(url); 
  
      setTimeout(() => {
          setIsPlayAgainDisabled(false);
      }, 4000);
  }

  useEffect(() =>{ 
    fetchData()
  },[])

  useEffect(() => {
    if (gameStarted) {
      getQuestions(url); 
    }
  }, [gameStarted]);

  useEffect(() => {
    const correctArray = questionsList.map((question) => question.correct_answer);
    setcorrectAnswers(correctArray);
  }, [questionsList]);

  return (
    <div className="App">
      
      {
        gameStarted ? 

        noQuestions ?
        <section className="no-questions" >
        <p className="no-questions-text">There are no questions available for the selected parameters.</p>
        <button 
          className="check-answers-btn" 
          type="button" 
          onClick={handleMenu}
        >
          Back to Menu
        </button>
      </section>
           :
        
        <div className='quiz-page'>
          
          {loading ? <SkeletonLoader /> :
          questionsList.map((questionObject)=>{
            const answers = [
              { text: questionObject.correct_answer, isCorrect: true },
              ...questionObject.incorrect_answers.map((answer) => (
                {
                  text: answer,
                  isCorrect: false,
                })),
            ]

            const shuffledAnswers = answers.sort(() => Math.random() - 0.5);

            return(
            <div className='question-container'>
              <p className='question'>{`${questionsList.indexOf(questionObject)+1}.`} {questionObject.question}</p>
              
              {
              questionObject.shuffledAnswers.map((shuffledAnswer) => {
                const isSelected = selectedAnswers[questionsList.indexOf(questionObject)] === shuffledAnswer.text;
                const isCorrect = correctAnswers[questionsList.indexOf(questionObject)] === shuffledAnswer.text;
                return(
                  <button 
                key={`${questionsList.indexOf(questionObject)+1}-${shuffledAnswer.text}`}
                onClick={()=>{
                    if(!isSubmitted){
                      const updatedArray=[...selectedAnswers]
                    updatedArray[questionsList.indexOf(questionObject)] = shuffledAnswer.text
                    setSelectedAnswers(updatedArray)
                    }
                }}
                className={`answer-choice ${
                  isSubmitted
                    ? isCorrect
                      ? "correct"
                      : isSelected
                      ? "incorrect"
                      : "unselected"
                    : isSelected ? "clicked": "" }`}
                >
                  {shuffledAnswer.text}</button>
                )
              })}
              
            </div>
            )
        })
          }

          <div className='check-answer-btn-container'>
          {!isSubmitted && <button onClick={compareAnswers} className='check-answers-btn'>
              Check Answers
          </button>}

          {
            isSubmitted && <p className='score-text'>
              You got {score}/10 answers correct
            </p>
          }

          {
            isSubmitted && <button 
            className='check-answers-btn play-again' 
            onClick={()=>{handlePlayAgain()}}
            disabled={isPlayAgainDisabled}
            >
            {isPlayAgainDisabled ? `Play again (${playAgainCountdown})` : 'Play again'}
              </button> 
          }
          {
            isSubmitted && <button 
              className='check-answers-btn' 
              onClick={handleMenu}
              >
              Menu
                </button> 
          }
          </div>
        </div>
        
        :

        <main>
        <div className='header-container'>
          <h1 className='header'>Quizzical</h1>
          <p className='subheader'>Let's get quizzical!</p>
        </div>
      
        <div className='container-container'>
          <div className='quiz-options-container category'>
            <h3 className='quiz-options-container-header'>Category</h3>
            <div className='container-buttons'>
    
                {
                    [{id: "", name: "Any Category"},...categories].map((category) => (
                      <button 
                      key = {category.id}
                      value={category.id} 
                      onClick = {()=>setSelectedCategory(category.id)}
                      className={selectedCategory === category.id ? 'selected' : 'btn-choice'}>
                        {category.name }
                        </button>
                    ))
                }
            </div>
          </div>

          <div className='quiz-options-container questions'>
            <h3 className='quiz-options-container-header'>Number of Questions</h3>
            <div className='container-buttons'>
            {['10', '20', '30', '40', '50'].map((num) => (
                    <button
                      key={num}
                      value={num}
                      className={questionNumber === num ? 'selected' : 'btn-choice'}
                      onClick={() => setQuestionNumber(num)}
                    >
                      {num}
                    </button>
              )) }
            </div>
          
          </div>

          <div className='quiz-options-container difficulty'>
            <h3 className='quiz-options-container-header'>Difficulty</h3>
            <div className='container-buttons'>
              {
                ["", "easy", "medium", "hard"].map((level)=>
                (
                  <button
                    key={level}
                    value={level}
                    className={difficulty === level ? 'selected' : 'btn-choice'}
                    onClick={()=>setDifficulty(level)}>
                    {level || "Any Difficulty"}
                  </button>
                ))
              }
            </div>
            
          </div>

          <div className='quiz-options-container type'>
            <h3 className='quiz-options-container-header'>Type of Question</h3>
            <div className='container-buttons'>
              {["", "multiple", "boolean"].map((type)=> (
                <button value={type}
                key={type}
                className= {questionType === type ? 'selected' : 'btn-choice'}
                onClick={()=> setQuestionType(type)}>
                  {type || "Any type"}
                  </button>
              ))
                  
            }
            </div>
            
          </div>

          
        </div>
        <div className='button-container'>
            <button 
            className='start-btn' 
            onClick={handleGameStarted} 
            disabled={isStartDisabled} >
             {isStartDisabled ? `Start quiz (${startCountdown})` : 'Start quiz'}
              </button>
        </div>
        </main>
  }
    </div>
  );
}

export default App;

