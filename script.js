// Conversation history for basic chat demo
let conversationHistory = [];

// Function to open tabs
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Basic Chat example
async function runBasicChat() {
    const outputElement = document.getElementById('basicChatOutput');
    const userInput = document.getElementById('basicChatInput').value.trim();
    
    if (!userInput) {
        outputElement.textContent = "Please enter a message first.";
        return;
    }
    
    outputElement.textContent = "Thinking...";
    
    try {
        // Add user message to conversation history
        const newMessage = {
            role: "user",
            content: userInput
        };
        
        conversationHistory.push(newMessage);
        
        // Only keep most recent messages to avoid context limit
        conversationHistory = conversationHistory.slice(-10);
        
        // Make the API call
        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a friendly assistant who speaks in rhyming verse."
                },
                ...conversationHistory
            ]
        });
        
        // Add AI response to conversation history
        conversationHistory.push(completion);
        
        // Display the response
        outputElement.textContent = completion.content;
        
    } catch (error) {
        outputElement.textContent = `Error: ${error.message}`;
        console.error("Chat error:", error);
    }
}

// JSON Output example
async function runJsonExample() {
    const outputElement = document.getElementById('jsonOutput');
    const userInput = document.getElementById('jsonInput').value.trim();
    
    if (!userInput) {
        outputElement.textContent = "Please enter concepts to combine.";
        return;
    }
    
    outputElement.textContent = "Processing...";
    
    try {
        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Combine the following concepts into a single, coherent idea.
Respond directly with JSON, following this JSON schema, and no other text.
{
  concept: string;
  emoji: string;
}`
                },
                {
                    role: "user",
                    content: userInput
                }
            ],
            json: true
        });
        
        const result = JSON.parse(completion.content);
        
        // Display prettified JSON
        outputElement.innerHTML = `<strong>Concept:</strong> ${result.concept}<br><strong>Emoji:</strong> ${result.emoji}<br><br><pre>${JSON.stringify(result, null, 2)}</pre>`;
        
    } catch (error) {
        outputElement.textContent = `Error: ${error.message}`;
        console.error("JSON example error:", error);
    }
}

// Image input and analysis
document.getElementById('imageUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            
            const previewDiv = document.getElementById('imagePreview');
            previewDiv.innerHTML = '';
            previewDiv.appendChild(img);
            
            document.getElementById('analyzeBtn').disabled = false;
        };
        reader.readAsDataURL(file);
    }
});

async function analyzeImage() {
    const outputElement = document.getElementById('imageAnalysisOutput');
    const imagePreview = document.getElementById('imagePreview');
    
    if (!imagePreview.querySelector('img')) {
        outputElement.textContent = "Please upload an image first.";
        return;
    }
    
    const imageDataUrl = imagePreview.querySelector('img').src;
    outputElement.textContent = "Analyzing image...";
    
    try {
        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Determine if the image is a natural photograph of an animal.
Respond directly with JSON, following this JSON schema, and no other text.
{
  isPhotograph: boolean;
  isAnimal: boolean;
  isInNature: boolean;
  description: string;
}`
                        },
                        {
                            type: "image_url",
                            image_url: { url: imageDataUrl }
                        }
                    ]
                }
            ],
            json: true
        });
        
        const result = JSON.parse(completion.content);
        
        // Display results
        let resultHtml = `
            <p><strong>Is a photograph:</strong> ${result.isPhotograph ? "Yes" : "No"}</p>
            <p><strong>Contains animal:</strong> ${result.isAnimal ? "Yes" : "No"}</p>
            <p><strong>In natural setting:</strong> ${result.isInNature ? "Yes" : "No"}</p>
            <p><strong>Description:</strong> ${result.description || "Not provided"}</p>
            <pre>${JSON.stringify(result, null, 2)}</pre>
        `;
        
        outputElement.innerHTML = resultHtml;
        
    } catch (error) {
        outputElement.textContent = `Error: ${error.message}`;
        console.error("Image analysis error:", error);
    }
}

// Image generation
async function generateImage() {
    const outputElement = document.getElementById('imageGenOutput');
    const prompt = document.getElementById('imagePrompt').value.trim();
    const aspectRatio = document.getElementById('aspectRatio').value;
    
    if (!prompt) {
        outputElement.innerHTML = "<p>Please enter an image prompt.</p>";
        return;
    }
    
    outputElement.innerHTML = "<p>Generating image... This may take a moment.</p>";
    
    try {
        const result = await websim.imageGen({
            prompt: prompt,
            aspect_ratio: aspectRatio
        });
        
        if (result && result.url) {
            const img = document.createElement('img');
            img.src = result.url;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '4px';
            
            outputElement.innerHTML = "";
            outputElement.appendChild(img);
        } else {
            outputElement.innerHTML = "<p>Failed to generate image. No URL returned.</p>";
        }
        
    } catch (error) {
        outputElement.innerHTML = `<p>Error: ${error.message}</p>`;
        console.error("Image generation error:", error);
    }
}

