var animatePoints = function() {
              
    var points = document.getElementsByClassName('point');
              
    var revealPoint = function(n) {
        points[n].style.opacity = 1;
        points[n].style.transform = "scaleX(1) translateY(0)";
        points[n].style.msTransform = "scaleX(1) translateY(0)";
        points[n].style.WebkitTransform = "scaleX(1) translateY(0)";
    };
              
    for (var i = 0; i < points.length; i++) {
      revealPoint(i);
     }
};