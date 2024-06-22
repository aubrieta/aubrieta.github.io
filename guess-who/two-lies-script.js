function showResults() {
    // Initialize character array
    let character = [];

    // Get user's answers from radio buttons
    character.push(parseInt(document.querySelector('input[name="q1"]:checked').value));
    character.push(parseInt(document.querySelector('input[name="q2"]:checked').value));
    character.push(parseInt(document.querySelector('input[name="q3"]:checked').value));
    character.push(parseInt(document.querySelector('input[name="q4"]:checked').value));
    character.push(parseInt(document.querySelector('input[name="q5"]:checked').value));
    character.push(parseInt(document.querySelector('input[name="q6"]:checked').value));
    character.push(parseInt(document.querySelector('input[name="q7"]:checked').value));

    // Define the parity-check matrix H and syndrome vectors
    const H = [
        [1, 1, 0, 1, 1, 0, 0],
        [1, 0, 1, 1, 0, 1, 0],
        [0, 1, 1, 1, 0, 0, 1]
    ];
    const syndrome = [
        [1, 1, 0],
        [1, 0, 1],
        [0, 1, 1],
        [1, 1, 1],
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];

    let receivedWord = character.slice(); // Copy of character array

    let possibleResults = [];

    // Check for all pairs of possible error positions
    for (let i = 0; i < receivedWord.length; i++) {
        for (let j = i + 1; j < receivedWord.length; j++) {
            // Flip the bits at positions i and j
            let tempWord = receivedWord.slice();
            tempWord[i] = (tempWord[i] === 1) ? 0 : 1;
            tempWord[j] = (tempWord[j] === 1) ? 0 : 1;

            // Calculate syndrome for the new word
            let calculatedSyndrome = [0, 0, 0];
            for (let k = 0; k < H.length; k++) {
                let sum = 0;
                for (let l = 0; l < H[k].length; l++) {
                    sum += H[k][l] * tempWord[l];
                }
                calculatedSyndrome[k] = sum % 2;
            }

            // If syndrome is zero, it's a valid codeword
            if (arraysEqual(calculatedSyndrome, [0, 0, 0])) {
                // Define character dictionary (similar to your Sage code)
                const charDict = {
                    '0000000': 'Fanny',
                    '0001111': 'Arthur',
                    '0010011': 'Coraline',
                    '0011100': 'Hippolyte',
                    '0100101': 'Gwen',
                    '0101010': 'Augustin',
                    '0110110': 'Maggie',
                    '0111001': 'Roger',
                    '1000110': 'Martin',
                    '1001001': 'Theophile',
                    '1010101': 'Capucine',
                    '1011010': 'Maxime',
                    '1100011': 'Melina',
                    '1101100': 'Robin',
                    '1110000': 'Sandra',
                    '1111111': 'Justine'
                };

                let char = charDict[tempWord.join('')];
                if (char) {
                    possibleResults.push({ character: char, errors: [i + 1, j + 1] });
                }
            }
        }
    }

    if (possibleResults.length > 0) {
        let resultText = "Possible characters and lies:<br>";
        for (let result of possibleResults) {
            resultText += `Character: ${result.character}, lies about questions: ${result.errors.join(' and ')}<br>`;
        }
        document.getElementById('results').innerHTML = resultText;
    } else {
        document.getElementById('results').innerHTML = "No valid characters found. Please check your responses.";
    }
}

// Function to compare arrays
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}
