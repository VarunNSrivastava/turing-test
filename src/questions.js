async function generate_questions(n) {
    let randomQuestions = [];

    // Using fetch API (For browser environment)
    const response = await fetch('./questions_dataset.json');
    const data = await response.json();

    for(let i=0; i<n; i++){
        let randomIndex = Math.floor(Math.random() * data.length);
        randomQuestions.push(data[randomIndex]);

        // Remove the selected question from the data array to avoid duplication
        data.splice(randomIndex, 1);
    }
    return randomQuestions;
}

export {generate_questions};
