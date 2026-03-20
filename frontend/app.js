document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn');
    const subtitleDisplay = document.getElementById('subtitle-display');

    let sessionId = localStorage.getItem('goku_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('goku_session_id', sessionId);
    }

    sendBtn.addEventListener('click', sendMessage);

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;
        
        userInput.value = '';
        if(subtitleDisplay) {
            subtitleDisplay.innerText = "Thinking...";
            subtitleDisplay.classList.add('visible');
            subtitleDisplay.classList.add('thinking');
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, message: text })
            });

            if (subtitleDisplay) subtitleDisplay.classList.remove('thinking');

            if (response.ok) {
                const data = await response.json();
                handleModelResponse(data.response);
            } else {
                handleModelResponse("[action: angry] Error: Failed to connect to my brain. Need a Senzu bean!");
            }
        } catch (error) {
            if (subtitleDisplay) subtitleDisplay.classList.remove('thinking');
            handleModelResponse("[action: angry] Error: Something went wrong. Connection lost!");
        }
    }

    function handleModelResponse(content) {
        let action = 'idle';
        let spokenText = content;
        
        const actionMatch = content.match(/\[action:\s*([^\]]+)\]/i) || content.match(/\[emotion:\s*([^\]]+)\]/i);
        if (actionMatch) {
            action = actionMatch[1].toLowerCase().trim();
            spokenText = content.replace(/\[.*?\]/g, '').trim();
        }
        
        if (subtitleDisplay) {
            subtitleDisplay.innerText = spokenText;
            subtitleDisplay.classList.add('visible');
        }

        window.gokuCurrentAction = action;
        speak(spokenText);
    }

    window.gokuIsTalking = false;
    function speak(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const plainText = text.replace(/[*_#]/g, '');
            const utterance = new SpeechSynthesisUtterance(plainText);
            utterance.rate = 1.1; 
            utterance.pitch = 1.0;
            const voices = window.speechSynthesis.getVoices();
            const maleVoice = voices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('boy'));
            if (maleVoice) utterance.voice = maleVoice;

            utterance.onstart = () => { window.gokuIsTalking = true; };
            utterance.onend = () => { 
                window.gokuIsTalking = false; 
                window.gokuCurrentAction = 'idle'; // return to idle
                setTimeout(() => subtitleDisplay.classList.remove('visible'), 3000);
            };
            utterance.onerror = () => { window.gokuIsTalking = false; };

            window.speechSynthesis.speak(utterance);
        }
    }

    if ('speechSynthesis' in window) window.speechSynthesis.getVoices();

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = function() {
            if(micBtn) micBtn.classList.add('listening');
            if(subtitleDisplay) {
                subtitleDisplay.innerText = "Listening...";
                subtitleDisplay.classList.add('visible');
            }
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            sendMessage();
        };

        recognition.onerror = function(event) {
            if(micBtn) micBtn.classList.remove('listening');
            if(subtitleDisplay) subtitleDisplay.classList.remove('visible');
        };

        recognition.onend = function() {
            if(micBtn) micBtn.classList.remove('listening');
        };

        if(micBtn) {
            micBtn.addEventListener('click', () => {
                if (micBtn.classList.contains('listening')) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            });
        }
    } else {
        if(micBtn) micBtn.style.display = 'none';
        console.warn("Speech recognition not supported in this browser.");
        if(subtitleDisplay) subtitleDisplay.innerText = "Speech Recognition Not Supported";
    }
});
