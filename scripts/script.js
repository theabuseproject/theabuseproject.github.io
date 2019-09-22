var win = window,
    doc = document;

function hasClass(el, cls) {
  return el.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
};

function addClass(el, cls) {
  if (!this.hasClass(el, cls)) {
    el.className += " " + cls;
  }
};

function removeClass(el, cls) {
  if (this.hasClass(el, cls)) {

    var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
    el.className = el.className.replace(reg,' ');
  }
};

var site = doc.querySelectorAll('.site-wrap')[0],
    wrap = doc.querySelectorAll('.panel-wrap')[0],
    panel = doc.querySelectorAll('.panel'),
    zoom = doc.querySelectorAll('.js-zoom'),
    nav_up = doc.querySelectorAll('.js-up'),
    nav_left = doc.querySelectorAll('.js-left'),
    nav_right = doc.querySelectorAll('.js-right'),
    nav_down = doc.querySelectorAll('.js-down'),
    animation = doc.querySelectorAll('.js-animation'),
    pos_x = 0,
    pos_y = 0;

function setPos(){
  wrap.style.transform = 'translateX(' + pos_x + '00%) translateY(' + pos_y + '00%)';
  setTimeout( function(){
    removeClass(wrap, 'animate');
  }, 600);
}

setPos();

function moveUp(){
  addClass(wrap, 'animate');
  pos_y++;
  setPos();
}

function moveLeft(){
  addClass(wrap, 'animate');
  pos_x++;
  setPos();
}

function moveRight(){
  addClass(wrap, 'animate');
  pos_x--;
  setPos();
}

function moveDown(){
  addClass(wrap, 'animate--scale');
  pos_y--;
  setPos();
}

for (var x = 0; x < nav_up.length; x++){
  nav_up[x].addEventListener('click', moveUp);
}

for (var x = 0; x < nav_left.length; x++){
  nav_left[x].addEventListener('click', moveLeft);
}

for (var x = 0; x < nav_right.length; x++){
  nav_right[x].addEventListener('click', moveRight);
}

for (var x = 0; x < nav_down.length; x++){
  nav_down[x].addEventListener('click', moveDown);
}

for (var x = 0; x < zoom.length; x++){
  zoom[x].addEventListener('click', zoomOut);   
}

function zoomOut(e){
  e.stopPropagation();
  addClass(site, 'show-all');
  for (var x = 0; x < panel.length; x++){
    ( function(_x){
      panel[_x].addEventListener('click', setPanelAndZoom);
    })(x);
  }
}

function setPanelAndZoom(e){
  pos_x = -e.target.getAttribute('data-x-pos'),
  pos_y = e.target.getAttribute('data-y-pos');
  setPos();
  zoomIn();
}


function zoomIn(){
  for (var x = 0; x < panel.length; x++){
    panel[x].removeEventListener('click', setPanelAndZoom);
  }
  removeClass(site, 'show-all');
}

// GITHUB

$('[data-github]').each(function () {
  var _this = this;
  var repo = $(_this).data('github')

  fetch('https://api.github.com/repos/' + repo).then(function (response) {
    return response.json();
  }).then(function (response) {
    $(_this).find('[data-forks]').text(response.forks);
    $(_this).find('[data-stars]').text(response.stargazers_count);
  });
});

// FOUNDERS

var peopleList = [
  "https://goj2.com/wp-content/uploads/2019/01/zacSlider.png",
  "https://avatars3.githubusercontent.com/u/5800726?s=460&v=4"
]
var indexLength = peopleList.length;
var currIndex = 0;
document.getElementById("person").addEventListener("animationiteration", function() {
  document.getElementById("imgModule").src=peopleList[currIndex];
  if(currIndex < indexLength-1){
    currIndex++;
  }else{
    currIndex = 0;
  }
}, false);

// =============================================================

window.addEventListener('load', function(){
  // vars
  video = document.getElementById('video');
  playButton = document.getElementById('play-button');
  pbarContainer = document.getElementById('pbar-container')
  pbar = document.getElementById('pbar');
  timeField = document.getElementById('time-field');
  soundButton = document.getElementById('sound-button');
  sbarContainer = document.getElementById('sbar-container');
  sbar = document.getElementById('sbar');
  fullscreenButton = document.getElementById('fullscreen-button');
  playScreen = document.getElementById('screen');
  screenButton = document.getElementById('screen-button');


  video.load();
  video.addEventListener('canplay', function(){
    playButton.addEventListener('click', playOnPause, false);
    pbarContainer.addEventListener('click', skip, false);
    updatePlayer();
    soundButton.addEventListener('click', muteOrUnmute, false);
    sbarContainer.addEventListener('click', updateVolume, false);
    fullscreenButton.addEventListener('click', fullscreen, false);
    screenButton.addEventListener('click', playOnPause, false);

  })

}, false);

function playOnPause(){
  if(video.paused){
    video.play();
    playButton.src = 'https://github.com/cjbeowulf/codepenimgs/blob/master/playerimgs/pause.png?raw=true';
    update = setInterval(updatePlayer, 30);

    playScreen.style.display = 'none';
  } else{
    video.pause();
    playButton.src = 'https://github.com/cjbeowulf/codepenimgs/blob/master/playerimgs/play.png?raw=true'
    window.clearInterval(update);

    playScreen.style.display = 'block';
    screenButton.src = 'https://github.com/cjbeowulf/codepenimgs/blob/master/playerimgs/play.png?raw=true';
  }
}

function updatePlayer(){
  var percentage = (video.currentTime/video.duration)*100;
  pbar.style.width = percentage + '%';
  timeField.innerHTML = getFormattedTime();
  if(video.ended){
    window.clearInterval(update);
    playButton.src = 'https://github.com/cjbeowulf/codepenimgs/blob/master/playerimgs/replay.png?raw=true';

    playScreen.style.display = 'block';
    screenButton.src = 'https://github.com/cjbeowulf/codepenimgs/blob/master/playerimgs/replay.png?raw=true';
  } else if(video.paused){
    playButton.src = 'https://github.com/cjbeowulf/codepenimgs/blob/master/playerimgs/play.png?raw=true';
    screenButton.src = 'https://github.com/cjbeowulf/codepenimgs/blob/master/playerimgs/play.png?raw=true'
  }
}

function skip(ev){
  var mouseX = ev.pageX - pbarContainer.offsetLeft;
  var width = window.getComputedStyle(pbarContainer).getPropertyValue('width');
  width = parseFloat(width.substr(0, width.length - 2));

  video.currentTime = (mouseX/width)*video.duration

  updatePlayer();
}

function getFormattedTime(){
  var seconds = Math.round(video.currentTime);
  var mintues = Math.floor(seconds/60);
  if(mintues > 0) seconds -= mintues*60;
  if(seconds.toString().length === 1) seconds = '0' + seconds;

  var totalSeconds = Math.round(video.duration);
  var totalMintues = Math.floor(totalSeconds/60);
  if(totalMintues > 0) totalSeconds -= totalMintues*60;
  if (totalSeconds.toString().length === 1) totalSeconds = '0' + totalSeconds;

  return mintues + ':' + seconds + '/' + totalMintues + ':' + totalSeconds;
}

function muteOrUnmute(){
  if(!video.muted){
    video.muted = true;
    soundButton.src  = 'https://github.com/cjbeowulf/codepenimgs/blob/master/playerimgs/mute.png?raw=true'
    sbar.style.display = 'none';
  } else{
    video.muted = false;
    soundButton.src = 'https://github.com/cjbeowulf/codepenimgs/blob/master/playerimgs/sound.png?raw=true'
    sbar.style.display = 'block';
  }
}

function updateVolume(ev){
  var mouseX = ev.pageX - sbarContainer.offsetLeft;
  var width = window.getComputedStyle(sbarContainer).getPropertyValue('width');
  width = parseFloat(width.substr(0, width.length - 2));

  video.volume = (mouseX/width);
  sbar.style.width = (mouseX/width)*100 + '%';
  video.muted = false;
  soundButton.src = 'https://github.com/cjbeowulf/codepenimgs/blob/master/playerimgs/sound.png?raw=true'
  sbar.style.display = 'block';
}

function fullscreen(){
  if(video.requestFullscreen){
    video.requestFullscreen();
  } else if(video.webkitRequestFullscreen){
    video.webkitRequestFullscreen();
  } else if(video.mozRequestFullscreen){
    video.mozRequestFullscreen();
  } else if(video.msRequestFullscreen){
    video.msRequestFullscreen();

  }
}