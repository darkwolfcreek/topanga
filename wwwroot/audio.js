var audioContext = null;
var currentOscillator = null;
var currentGainNode = null;
var isTonePlaying = false;
async function playTone(frequency, oscillatorType, volume, impulseFrequency) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    if (isTonePlaying) {
        await stopTone();
    }

    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();

    oscillator.type = oscillatorType;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();

    currentOscillator = oscillator;
    currentGainNode = gainNode;
    isTonePlaying = true;

    if (impulseFrequency && impulseFrequency > 0) {
        startImpulseTrain(impulseFrequency, gainNode, volume);
    }
}

function stopTone() {
    return new Promise((resolve, reject) => {
        if (currentOscillator) {
            currentGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.05);

            currentOscillator.stop(audioContext.currentTime + 0.05);
            currentOscillator.onended = () => {
                currentOscillator.disconnect();
                currentGainNode.disconnect();
                currentOscillator = null;
                currentGainNode = null;
                isTonePlaying = false;
                resolve();
            };

            if (impulseIntervalId) {
                clearInterval(impulseIntervalId);
                impulseIntervalId = null;
            }
        } else {
            resolve();
        }
    });
}

var impulseIntervalId = null;

function startImpulseTrain(impulseFrequency, gainNode, volume) {
    if (impulseIntervalId) {
        clearInterval(impulseIntervalId);
    }

    var intervalTime = 1 / impulseFrequency;
    var impulseDuration = 0.005;

    impulseIntervalId = setInterval(function () {
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + impulseDuration);
    }, intervalTime * 1000);
}

async function playMidiSequence(notes, oscillatorType, volume) {
    const pianoRoll = document.getElementById('pianoRoll');

    for (let note of notes) {
        playTone(note.frequency, oscillatorType, volume, 0);

        const notePosition = note.startTime * 50;
        pianoRoll.scrollLeft = notePosition;

        await new Promise(resolve => setTimeout(resolve, note.duration * 1000));
        stopTone();
    }
}


window.playMidiSequence = playMidiSequence;

function setInitialScrollPosition(position) {
    var pianoRoll = document.querySelector('.col-md-10');
    if (pianoRoll) {
        console.log("Setting scroll position to:", position);
        pianoRoll.scrollTop = position;
    }
}

function syncScroll(leftPanelId, rightPanelId) {
    var leftPanel = document.getElementById(leftPanelId);
    var rightPanel = document.getElementById(rightPanelId);

    rightPanel.addEventListener('scroll', function () {
        leftPanel.scrollTop = this.scrollTop;
    });
}

function adjustVolume(volume) {
    if (currentGainNode) {
        currentGainNode.gain.value = volume;
    }
}

window.playTone = playTone;
window.stopTone = stopTone;
window.adjustVolume = adjustVolume;