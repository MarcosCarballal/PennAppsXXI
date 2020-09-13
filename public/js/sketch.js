var resolution = 50;
var col;
var col2;

var colWave;

var intervall;
var r;

//slider
var slider;
var alphaSlider;

//checkboxes
var micBox;
var micOutBox;

//sound
var music;
var fft;
var mic;

var backCol;

function playMusic(url) {
  music = loadSound(url);
}

function stopMusic() {
    music.stop();
}

function setup() {
  var canvas = createCanvas(500, 500);
  canvas.parent('audio-visualizer');
  
  rectMode(CORNER);
    
  //set the colors
  col = color(0, 255, 0);
  col2 = color(0, 255, 0, 50);
  colWave = color(0, 100, 255, 150);
  backCol = color(0);
    
  //create the sliders
//   slider = createSlider(20, 1000, 300, 1);
//   slider.style('width', '300px');
//   slider.position(10, height -height*0.1);
  
//   alphaSlider = createSlider(0, 255, 50, 1);
//   alphaSlider.style('width', '300px');
//   alphaSlider.position(10, height - height*0.2);
  
  //Checkboxes
//   micBox = createCheckbox('Mic input', false);
//   micBox.style('color', color(255));
//   micBox.changed(enableMic);
//   micBox.position(10, height -height*0.15);
  
//   micOutBox = createCheckbox('Output mic input', false);
//   micOutBox.style('color', color(255));
//   micOutBox.changed(enableMicOut);
//   micOutBox.position(10+150, height -height*0.15);
  
  calcValues();
  
  //Music
  fft = new p5.FFT();
  
  mic = new p5.AudioIn();
  mic.connect(fft);
  
  music.play();
}

function draw() {
  background(0, backCol/2, backCol, 50);
  //background(0, 50, 100);
  backCol = 0;
  
  calcValues();
  
  //visualize
  visualizeSpectrum();
  visualizeWaveform();
}

function calcValues() {
  resolution = 300;
  
  r = height*0.3;
  
  var angleStep = TWO_PI/resolution;
  var otherAngles = PI - angleStep;
  
  intervall = 2*r * sin(angleStep/2);
}

function visualizeSpectrum() {
  //make spectrum usable
  var spectrum = fft.analyze();
  var specInter = floor(spectrum.length/resolution);
  var reducedSpec = [];
  
  for(var i = 0; i < resolution; i++) {
    reducedSpec.push(spectrum[i*specInter]);
  }
    
  //draw the spectrum visualizer
  for(var i = 0; i < resolution; i++) {
    var scale = map(reducedSpec[i], 0, 255, 0, r*0.5);  
      
    var angle = map(i, 0, resolution, 0, TWO_PI);
    var y = r * sin(angle - PI/2);
    var x = r * cos(angle - PI/2);
    
    push();
    translate(width/2 + x, height/2 + y);
    rotate(angle);   
    stroke(col);
    strokeWeight(2);
    fill(col2);
    rect(-intervall/2, -scale, intervall, scale);
    pop();
    backCol += reducedSpec[i];
  }
  
  backCol /= resolution;
  
  backCol = map(backCol, 0, 255, 0, 100);
}

function visualizeWaveform() {
  //make waveform usable
  var waveform = fft.waveform();
  var waveInter = floor(waveform.length/resolution);
  var reducedWave = [];
  
  for(var i = 0; i < resolution; i++) {
    reducedWave.push(waveform[i*waveInter]);
  }
  
  //draw waveform
  beginShape();
  noFill();
  stroke(colWave);
  strokeWeight(4);
  translate(width/2, height/2);
  for(var i = 0; i < resolution; i++) {
    var off = map(reducedWave[i], -1, 1, -r/2, r/2);  
    
    var angle = map(i, 0, resolution, 0, TWO_PI);
    var y = ((r-r*0.1)+off) * sin(angle);
    var x = ((r-r*0.1)+off) * cos(angle);
    
    vertex(x, y);
  }
    endShape(CLOSE);
  
}

function enableMic() {
  if (this.checked()) {
    music.stop();
    mic.start();
  } else {
    //mic.stop(); //currently not working in Chrome
    music.play();
  }
}

function enableMicOut() {
  if (this.checked()) {
    mic.connect();
  } else {
    music.disconnect(); //This doesn't seem to work either...
  }
}