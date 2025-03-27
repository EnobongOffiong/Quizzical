import React from "react";

export default function Quiz(){

    async function fetchQuestions(){
        const response = await fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=medium&type=boolean")
    const data = await response.json()
    const dataArray = data.results
    console.log(dataArray)
    }
    return(
        <div>

        </div>
    )
}