var pointsArray = document.getElementsByClassName('point');

var animatePoints = function(points) {
              
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

window.onload = function() {
    if (window.innerHeight > 950) {
        animatePoints(pointsArray);
    }
    
    var sellingPoints = document.getElementsByClassName('selling-points')[0];
    var scrollDistance = sellingPoints.getBoundingClientRect().top - window.innerHeight + 200;
    console.log(scrollDistance);
    
    window.addEventListener('scroll', function(event) {
       console.log(document.body.scrollTop);
       if (document.documentElement.scrollTop || document.body.scrollTop >= scrollDistance) {
           animatePoints(pointsArray);
           console.log('SHOW THE POINTS!');
       }
    });
}