const audioContext = new AudioContext();

let sourceNode, analyserNode;
let audioSetup = false;

const currentPiece = document.getElementById("current-piece");

const music = document.getElementById("audio");

const playCurrentBtn = document.getElementById("play-current-btn");

const recordBtn = document.getElementById("record-btn");

let playBtnText = "Play";
let isPlaying = false;

let recordBtnTextText = "Record";
let isRecording = false;

playCurrentBtn.addEventListener("click", (e) => {
    isPlaying = !isPlaying;
        if(isPlaying){
            setupAudio();
            music.play();
            playCurrentBtn.textContent = "Stop";
        } else {
            music.pause();
            playCurrentBtn.textContent = "Start";
        }

})

music.addEventListener("ended", () => {
    playCurrentBtn.textContent = "Start";
})

recordBtn.addEventListener("click", (e) => {
    isRecording = !isRecording;
    if(isRecording){
        recordBtn.textContent = "Recording";
    } else {
        recordBtn.textContent = "Record";
    }
})

const hydra = new Hydra({ 
    makeGlobal: false,
    canvas: document.getElementById("hydra-canvas"),
    detectAudio: true 
});

const audio1 = new Audio(audioContext);
const fft1 = audio1.fft;

function setupAudio(){
    if(audioSetup) return;
    audioSetup = true;

    sourceNode = audioContext.createMediaElementSource(music);
    analyserNode = audioContext.createAnalyser();
    analyserNode.fft = 1024;

    sourceNode.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    hydra.synth.a.setBins(4);
    hydra.synth.a.setScale(8);
    hydra.synth.a.setCutoff(0.2);
    hydra.synth.a.setSmooth(0.6);

    hydra.synth.a.analyser = analyserNode;
}

hydra.synth.voronoi(1, 0.1, 1.2)
// .mult(hydra.synth.osc(2, 0.4, 1))
// .scale(() => 0.0055 + hydra.synth.a.fft[0] * 0.022)
// .rotate(() => 0.5 + hydra.synth.a.fft[0], 0.3)
.out(hydra.synth.o0);

const hydra2 = new Hydra({
    makeGlobal: false,
    canvas: document.getElementById("this-piece"),
    detectAudio: false
})

hydra2.synth.osc()
.scale(() => 0.0055 + hydra.synth.a.fft[0] * 15)
// .rotate(() => hydra.synth.a.fft[1], 3)
.out(hydra2.synth.o0);

const hydra3 = new Hydra({
    makeGlobal: false,
    canvas: document.getElementById("new-section"),
    detectAudio: false
})

hydra3.synth.noise()
.color(0.35, 0.2, 0.6)
.kaleid(4)
.out(hydra3.synth.o0);