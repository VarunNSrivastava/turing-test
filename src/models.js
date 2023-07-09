import { pipeline } from '@xenova/transformers';

let embedder;
let questionAnswerPipe;

const loadModels = async () => {
    embedder = await pipeline("embeddings", 'Xenova/all-MiniLM-L6-v2');
    questionAnswerPipe = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
};

async function similarity(query, option) {
    let queryEmbed = await embed(query);
    let inputEmbedding = await embed(option);

    return calculateCosineSimilarity(queryEmbed, inputEmbedding);
}


function calculateCosineSimilarity(queryEmbedding, embedding) {
    let dotProduct = 0;
    let queryMagnitude = 0;
    let embeddingMagnitude = 0;
    let queryEmbeddingLength = queryEmbedding.length
    for (let i = 0; i < queryEmbeddingLength; i++) {
        dotProduct += queryEmbedding[i] * embedding[i];
        queryMagnitude += queryEmbedding[i] ** 2;
        embeddingMagnitude += embedding[i] ** 2;
    }
    return dotProduct / (Math.sqrt(queryMagnitude) * Math.sqrt(embeddingMagnitude));
}

let embeddingsDict = {};

async function embed(text) {
    if (text in embeddingsDict) {
        return embeddingsDict[text];
    }

    let e0 = await embedder(text, { pooling: 'mean', normalize: true });
    embeddingsDict[text] = e0["data"];
    return e0["data"];
}


export default loadModels;


console.log("models loaded!");



async function answerQuestion(question, context) {
    try {
        console.log(context);
        const results = await questionAnswerPipe(question, context);
        // Extract answer
        let answer = results.answer;
        // Find the first matching option
        const options = ['A', 'B', 'C', 'D', 'E'];
        for (let option of options) {
            if (answer.startsWith(option)) {
                return option;
            }
        }
        return options[Math.floor(Math.random() * options.length)]
    } catch(error) {
        console.error(error);
        return [];
    }
}

async function getMostSimilarOption(question, options) {
    let highestSimilarity = -1;
    let mostSimilarOption = 0;

    for (let i = 0; i < options.length; i++) {
        let sim = await similarity(question, options[i].text);

        if (sim > highestSimilarity) {
            highestSimilarity = sim;
            mostSimilarOption = i;
        }
    }

    return mostSimilarOption;
}



export {  getMostSimilarOption, answerQuestion };
