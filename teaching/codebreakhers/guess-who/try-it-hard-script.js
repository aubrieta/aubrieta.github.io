// Initial face codes
let faces = {
    'Face 1': '10101',
    'Face 2': '11000',
    'Face 3': '01111',
    'Face 4': '00010'
};

// Function to calculate Hamming distance
function hamming_distance(code1, code2) {
    let distance = 0;
    for (let i = 0; i < code1.length; i++) {
        if (code1[i] !== code2[i]) {
            distance++;
        }
    }
    return distance;
}

// Function to identify the face and the lie
function identify_face_and_lie(response) {
    for (let face in faces) {
        let code = faces[face];
        if (hamming_distance(response, code) === 1) {
            return { face: face, code: code };
        }
    }
    return null;
}

// Function to show the results
function showResults() {
    let response = [];
    response.push(document.querySelector('input[name="q1"]:checked').value);
    response.push(document.querySelector('input[name="q2"]:checked').value);
    response.push(document.querySelector('input[name="q3"]:checked').value);
    response.push(document.querySelector('input[name="q4"]:checked').value);
    response.push(document.querySelector('input[name="q5"]:checked').value);

    let result = identify_face_and_lie(response.join(''));

    if (result) {
        let liePosition = response.map((val, index) => val !== result.code[index] ? index + 1 : -1).filter(val => val > 0)[0];
        document.getElementById('results').textContent = `The face is ${result.face} and the lie was in question ${liePosition}.`;
    } else {
        document.getElementById('results').textContent = "Unable to identify the face. Please check the responses.";
    }
}

// Function to set custom traits
// Function to set custom traits
function setCustomTraits() {
    let customTraits = ['face1', 'face2', 'face3', 'face4'];
    let newFaces = {};

    for (let i = 0; i < customTraits.length; i++) {
        let checkboxes = document.querySelectorAll(`input[name="${customTraits[i]}"]`);
        let traitString = '';
        checkboxes.forEach(checkbox => {
            traitString += checkbox.checked ? '1' : '0';
        });
        newFaces[`Face ${i + 1}`] = traitString;
    }

    if (Object.values(newFaces).every(code => code.length === 5)) {
        faces = newFaces;
        document.getElementById('confirmationMessage').textContent = "Custom traits set successfully!";
    } else {
        document.getElementById('confirmationMessage').textContent = "Please select traits for all faces.";
    }
}
