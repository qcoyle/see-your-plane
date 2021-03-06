import * as parse from "./parse-flightradar.js"

export const render = async(url) => {

    // Object of elements we will update
    const DOMElements = {
        originResponse: document.querySelector('#origin'),
        destinationResponse: document.querySelector('#destination'),
        registrationResponse: document.querySelector('#registrationResponse'),
        imageResponse: document.querySelector('#imageResponse'),
        equipmentResponse: document.querySelector('#equipment'),
        flightTimeResponse: document.querySelector("#flightTime"),
        statusResponse: document.querySelector("#status"),
    }
    console.log(url);
    let response = undefined;

    // Check for fetch error
    try {
        response = await fetch(url);
    } catch (error) {
        renderRequestFailure(DOMElements);
        console.log(error);
    }
    console.log(response);
    if (response.ok) {
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        if (jsonResponse.errors) {
            renderRequestFailure(DOMElements);
        } else {
            renderSuccess(jsonResponse)(DOMElements); // Promise fails
        }
    } else {
        renderInvalidResponse(DOMElements); // Bad HTTP response
    }
}

const renderSuccess = jsonResponse => {
    let result = jsonResponse.result;
    let response = result.response;
    console.log(response);

    return function render(elements) {
        renderFlightData(response)(elements);
        renderImageData(response)(elements);
    }
}

export const renderRequestFailure = elements => {
    clearElements(elements)
    elements.originResponse.innerHTML = `<p class="alert alert-danger">Error: Request failed. Connection error to server.</p>`;
}

export const renderInvalidResponse = elements => {
    clearElements(elements)
    elements.originResponse.innerHTML = `<p class="alert alert-danger" style="margin: 10px">Error: The request succeeded but the flight could not be found. Flight information might be invalid.</p>`;
}

const clearElements = elements => {
    let DOMResponsesValues = Object.values(elements);
    console.log(DOMResponsesValues);
    DOMResponsesValues.forEach(element => {
        console.log(element);
        element.innerHTML = ""
    });
}

const renderFlightData = response => {
    return function run(elements) {
        const parsedData = parse.flightData(response)(elements);
        // Update DOM
        elements.registrationResponse.innerHTML = `<p><strong>Registration:</strong> ${parsedData.airline} ${parsedData.registration}</p>`;
        elements.originResponse.innerHTML = `<p><strong>Origin:</strong> ${parsedData.scheduledDepart} (local time) at ${parsedData.origin}</p>`;
        elements.destinationResponse.innerHTML = `<p><strong>Destination:</strong> ${parsedData.scheduledArrive} (local time) at ${parsedData.destination}</p>`;
        elements.flightTimeResponse.innerHTML = `<p><strong>Flight duration:</strong> ${parsedData.flightTime}</p>`;
        elements.equipmentResponse.innerHTML = `<p><strong>Aircraft:</strong> ${parsedData.equipment}</p>`;

        console.log(`inFlight is ${parsedData.inFlight}`);
        if (parsedData.inFlight) {
            elements.statusResponse.innerHTML = `<p><strong>Status:</strong> <span class="alert alert-success">In flight</span> <span style="font-family: monospace"> ${parsedData.status} (arrival time)</span>`
        } else {
            elements.statusResponse.innerHTML = `<p><strong>Status:</strong> <span class="alert alert-secondary" style="font-family: monospace">${parsedData.status}</span>`;
        }
    }
}

const renderImageData = response => {
    const parsedData = parse.imageData(response)
    return function render(elements) {
        if (parsedData === undefined) {
            elements.imageResponse.innerHTML = `<p>No plane image data found</p>`;
        } else {
            // Update DOM
            elements.imageResponse.innerHTML = `<p><strong>Your plane:</strong></p><img src=${parsedData.image}>`;
            let para = document.createElement("p");
            let node = document.createTextNode(`Photo copyright: ${parsedData.copyright}`);
            para.appendChild(node);
            elements.imageResponse.appendChild(para);
        }
    }
}