this.interval = null;
this.timeout = null;
this.nextVideo = null;
const app = document.getElementById("#app");
const fullscreenButton = $("#fullscreen");

var videoPath;
var wrkText;
var wrkString;
var ct;
var activeVideo;

//show website name
const showSiteName = true;

//what path to use to videos. Set only one to true
const usePlaylistPath = false;
const baseDirNxtDr = false;
const baseDirLocal = false;
const usePath2BaseDir = true;

//alert(path2BaseDir);

function getSecondsFromMidnight() {
  var now = new Date(),
    then = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
    diff = now.getTime() - then.getTime();

  return diff / 1000;
}

function getCurrentVideo() {
  const secondsFromMidnight = getSecondsFromMidnight();
  var currentVideoIndex = playlist.findIndex(
    (item) =>
      item.ClockStartTime <= secondsFromMidnight &&
      (item.PlayDuration * 60) + item.ClockStartTime > secondsFromMidnight
  );
  this.nextVideo = playlist[currentVideoIndex + 1];
  return playlist[currentVideoIndex];
}

function startTimer() {
  setTimeout(function () {
    this.interval = setInterval(function () {
      checkVideo();
    }, 100);
  }, 1000);
}

function playCurrentVideo() {
  const currentVideo = getCurrentVideo();
  // console.log(currentVideo, getSecondsFromMidnight())
  //const videoLocation = currentVideo.VideoLocation;
  const videoLocation = getVideoPath(currentVideo.VideoLocation);

  const offsetSec = currentVideo.OffsetSec;
  const clockStartTime = currentVideo.ClockStartTime;
  const secondsFromMidnight = getSecondsFromMidnight();
  const player = $("#video-player")[0];
  player.src = videoLocation;
  const videoPosition = secondsFromMidnight - clockStartTime + offsetSec;
  player.currentTime = videoPosition;
  player.play();

  activeVideo  = videoLocation;
}

function getVideoPath(path) {

  if (usePlaylistPath) {
    wrkString = path;
    videoPath = wrkString;

  } else if (baseDirNxtDr) {
    wrkText = window.location.pathname;
    ct = wrkText.lastIndexOf("/");
    wrkText = wrkText.slice(0,ct);
    ct = wrkText.lastIndexOf("/");
    wrkText = wrkText.slice(0,ct);
    //alert(wrkText);
    wrkString = path;
    // alert(wrkString);  
    ct = wrkString.indexOf("/BaseDir/");
    wrkString = wrkString.slice(ct);
    wrkString = wrkText + wrkString;
   //alert(wrkString);
    videoPath = wrkString;

  } else if (baseDirLocal) {
    wrkString = path; 
    ct = wrkString.indexOf("/BaseDir/");
    wrkString = wrkString.slice(ct);
    videoPath = window.location.pathname.replace('/index.html', wrkString)
    //alert(videoPath);

  } else if (usePath2BaseDir) {
    wrkString = path
    ct = wrkString.indexOf("/BaseDir/");
    wrkString = wrkString.slice(ct);
    wrkString = path2BaseDir + wrkString;
   //alert(wrkString);
    videoPath = wrkString;

  }

  return videoPath;

}

function checkVideo() {
  const currentVideo = getCurrentVideo();
  const playDuration = currentVideo.PlayDuration;
  const offsetSec = currentVideo.OffsetSec;
  const player = $("#video-player")[0];
  const currentTime = player.currentTime;
  videoPath = getVideoPath(currentVideo.VideoLocation);

  //console.log(activeVideo)
  // console.log(`file://${videoPath}`)
  // console.log( player.src)

  if (currentTime > offsetSec + (playDuration * 60)) {
    clearInterval(this.interval);
    playCurrentVideo();

//old conditions (player.src caused problems)
//  } else if (`file:///${currentVideo.VideoLocation}` !== player.src) {
//  } else if (!(currentTime > offsetSec + (playDuration * 60)) && currentVideo.StartMinute == 0) {
//  } else if (`file:///${currentVideo.VideoLocation}` !== player.src && currentVideo.StartMinute == 0) {

//use videoPath and require hr transition
//  } else if (`file://${videoPath}` !== player.src && currentVideo.StartMinute == 0) {

  //use videoPath and activeVideo and hr transition
  } else if (videoPath !== activeVideo && currentVideo.StartMinute == 0) {

    player.pause();
    clearInterval(this.interval);
    playCurrentVideo();
  }
}


function onVideoEnded() {
  clearInterval(this.interval);
  playCurrentVideo();
}

onFullScreenClick = () => {
  if (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement
  ) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  } else {
    if (app.requestFullscreen) {
      app.requestFullscreen();
      fullscreenButton.hide();
    } else if (app.mozRequestFullScreen) {
      /* Firefox */
      app.mozRequestFullScreen();
      fullscreenButton.hide();
    } else if (app.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      app.webkitRequestFullscreen();
      fullscreenButton.hide();
    } else if (app.msRequestFullscreen) {
      /* IE/Edge */
      app.msRequestFullscreen();
      fullscreenButton.hide();
    }
  }
};

function onVideoPlay() {
  // start video check
  startTimer();
  // preload next video
  if (this.nextVideo) {
    const videoSource = this.nextVideo.VideoLocation;
    $("#preload")[0].src = videoSource;
    $("#preload").append(`<source src="${videoSource}" type="video/mp4">`);
  }
  // decide if we display hour
  const currentVideo = getCurrentVideo();
  const secondsFromMidnight = getSecondsFromMidnight();
  const addHour = currentVideo.AddHour;
  const hourToDisplay = Math.floor((secondsFromMidnight / 60 / 60) % 12);
  const hour = hourToDisplay === 0 ? 12 : hourToDisplay;

  $("#hour").html(`${hour}`);
  if (addHour) {
    $("#hour").show();
  } else {
    $("#hour").hide();
  }

  //show website name
  if(showSiteName) {
    const topcom = "TheVideoClock.com"
    $("#topcom").html(topcom);
    $("#topcom").show();
  }
}

function onMouseMove() {    
  if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
    fullscreenButton.show();
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    this.timeout = setTimeout(function() {
      fullscreenButton.hide();
      this.timeout = null
    }, 3000)
  }
}

function onVideoError(error) {
  const currentVideo = getCurrentVideo();
  const durationInMS = currentVideo.PlayDuration * 60 * 1000;
  clearInterval(this.interval)
  $("#hour").hide();

  setTimeout(function(){
    playCurrentVideo()
  }, durationInMS + 1000)
}

(function () {
  playCurrentVideo();
  $("#video-player")[0].addEventListener("play", onVideoPlay);
  $("#video-player")[0].addEventListener("ended", onVideoEnded);
  fullscreenButton.bind("click", onFullScreenClick);
  $("#video-player")[0].addEventListener("mousemove", onMouseMove)
  $("#video-player")[0].addEventListener("error", onVideoError)
  app.addEventListener("fullscreenchange", (event) => {
    // document.fullscreenElement will point to the element that
    // is in fullscreen mode if there is one. If not, the value
    // of the property is null.
    if (!document.fullscreenElement) {
      $("#fullscreen").show();
    }
  });
})();
