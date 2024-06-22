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

    let foundError = false;
    let errQ = -1;

    // Check for syndrome matching
    for (let i = 0; i < syndrome.length; i++) {
        let expectedSyndrome = syndrome[i];
        let calculatedSyndrome = [0, 0, 0]; // Initialize syndrome calculation

        // Calculate syndrome
        for (let j = 0; j < H.length; j++) {
            let sum = 0;
            for (let k = 0; k < H[j].length; k++) {
                sum += H[j][k] * receivedWord[k];
            }
            calculatedSyndrome[j] = sum % 2; // Modulo 2 operation
        }

        // Compare calculated syndrome with expected syndrome
        if (arraysEqual(calculatedSyndrome, expectedSyndrome)) {
            foundError = true;
            errQ = i;
            break;
        }
    }

    if (foundError) {
        // Correct the detected error
        receivedWord[errQ] = (receivedWord[errQ] === 1) ? 0 : 1;

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

        // Display result
        document.getElementById('results').textContent = "Your character is actually " + charDict[receivedWord.join('')] + "! You lied about question " + (errQ + 1) + ".";
    } else {
        document.getElementById('results').textContent = "No error detected. Please check your responses.";
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
