var setSong = function(songNumber) {
  if (currentSoundFile) {
    currentSoundFile.stop();  
  }   
  currentlyPlayingSongNumber = parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
  // #1
  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
      // #2
      formats: [ 'mp3' ],
      preload: true
      // tells Buzz that the mp3 loaded as soon as the page loads
  });
    
  setVolume(currentVolume);
};

var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
}

var setVolume = function(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};

var getSongNumberCell = function(number) {
  return $('.song-item-number[data-song-number="' + number + '"]');  
};

var createSongRow = function(songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">'
    +   '   <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
    +   '   <td class="song-item-title">' + songName + '</td>'
    +   '   <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
    +   '</tr>'
    ;
    
    var $row = $(template);
    
    var clickHandler = function() {
        var songNumber = parseInt($(this).attr('data-song-number'));
        
        if (currentlyPlayingSongNumber !== null) {
            // Revert to song number for currently playing song because user started playing new song.
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }
        
        if (currentlyPlayingSongNumber !== songNumber) {
            // Switch from Play --> Pause button to indicate new song is playing.
            setSong(songNumber);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
            $('.main-controls .play-pause').html(playerBarPauseButton);
            
            var $volumeFill = $('.volume .fill');
            var $volumeThumb = $('.volume .thumb');
            $volumeFill.width(currentVolume + '%');
            $volumeThumb.css({left: currentVolume + '%'});
            
            $(this).html(pauseButtonTemplate);
            updatePlayerBarSong();
        
        } else if (currentlyPlayingSongNumber === songNumber) {
            // Switch from Pause --> Play button to pause currently playing song.
            
            if (currentSoundFile.isPaused()) {
              $(this).html(pauseButtonTemplate);
              $('.main-controls .play-pause').html(playerBarPauseButton);
              currentSoundFile.play();
              updateSeekBarWhileSongPlays();
            } else {
                $(this).html(playButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPlayButton);
                currentSoundFile.pause();
            }
        }
    };
    
    var onHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(playButtonTemplate);
        }
    };
    
    var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        console.log(songNumberCell);
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        console.log(songNumber);
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
        }
        console.log("songnumber type is " + typeof songNumber + "\n and setSong type is " + typeof setSong);
    };
    
    $row.find('.song-item-number').click(clickHandler);
    // #2
    $row.hover(onHover, offHover);
    // #3
    return $row;
};

var setCurrentAlbum = function(album) {
    currentAlbum = album;
    // #1
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');
    
    // #2
    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);
    
    // #3
    $albumSongList.empty();
    
    // #4
    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

var updateSeekBarWhileSongPlays = function() {
  if(currentSoundFile) {
      // #10
      currentSoundFile.bind('timeupdate', function(event) {
          // #11
          var seekBarFillRatio = this.getTime() / this.getDuration();
          var $seekBar = $('.seek-control .seek-bar');
          
          updateSeekPercentage($seekBar, seekBarFillRatio);
          
          console.log(this.getTime());
          setCurrentTimeInPlayerBar(this.getTime());
      });
  }  
};

var filterTimeCode = function(timeInSeconds) {
    // use the parseFloat() method to get the seconds in number form
    // store variable for whole seconds and whole minutes --> Math.floor()
    // return the time in the format X:XX
    
    var num = parseInt(timeInSeconds, 10);
    var hours = Math.floor(num / 3600);
    var minutes = Math.floor((num - (hours * 3600)) / 60);
    var seconds = num - (hours * 3600) - (minutes * 60);
    
    if (seconds < 10) {seconds = "0" + seconds;}
    
    return minutes + ':' + seconds;
    
};

var setCurrentTimeInPlayerBar = function(currentTime) {

    // code sets the text of the element with the '.current-time' to the current time in the song ...
    // start with 0 and add as time progresses
    
    var startTime = document.getElementsByClassName('current-time');
    var replaceStr = "<div class='current-time'>" + filterTimeCode(currentTime) + "</div>";
    $("div.current-time").replaceWith(replaceStr);
    
};

var setTotalTimeInPlayerBar = function(totalTime) {

    // code sets the text of the element with the '.total-time' to the length of the song ...
    // duration from fixtures.js
    
    var duration = document.getElementsByClassName('total-time');
    var replaceStr = "<div class='total-time'>" + filterTimeCode(totalTime) + "</div>";
    $("div.total-time").replaceWith(replaceStr);
    
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    // #1
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
    
    // #2
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
    var $seekBars = $('.player-bar .seek-bar');
    
    $seekBars.click(function(event) {
       // #3
       var offsetX = event.pageX - $(this).offset().left;
       var barWidth = $(this).width();
       // #4
       var seekBarFillRatio = offsetX / barWidth;
        
       if($(this).parent().attr('class') == 'seek-control') {
           seek(seekBarFillRatio * currentSoundFile.getDuration());
       } else {
           setVolume(seekBarFillRatio * 100);
       }
        
       // #5
       updateSeekPercentage($(this), seekBarFillRatio);
    });
    // #7
    $seekBars.find('.thumb').mousedown(function(event) {
        // #8
        var $seekBar = $(this).parent();
        
        // #9
        $(document).bind('mousemove.thumb', function(event) {
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            
            if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                setVolume(seekBarFillRatio);
            }
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
        
        // #10
        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};

var trackIndex = function(album, song) {
  return album.songs.indexOf(song);  
};

var previousSong = function() {
    var getLastSongNumber = function(index) {
      return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
      // condition ? value-it-true : value-if-false
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex--;
    // Use 'trackIndex()' to get index of the current song & increment the value of the index i--
    
    if(currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }
    
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    updatePlayerBarSong();
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};

var nextSong = function() {
    var getLastSongNumber = function(index) {
      return index == 0 ? currentAlbum.songs.length : index;
      // condition ? value-if-true : value-if-false
    };
    // Previous song
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex++;
    // Use 'trackIndex()' to get index of the current song & increment the value of the index i++
    
    if(currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }
    // Wrap final song to first song
    
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    updatePlayerBarSong();
    // Set new current song to 'currentSongFromAlbum'
    // Update the player bar
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $nextSongNumberCell = getSongNumberCell(currentSongIndex + 1);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    // Update the HTML of the previous song's '.song-item-number' with a number
    
    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    // Update the HTML of the new song's '.song-item-number' with a pause
};

var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
    setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
   
};

// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

// Store state of playing songs
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
});