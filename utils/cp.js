(function() {
var ads = [{"title":"Game Changer","link":"http:\/\/blogs.unity3d.com\/2016\/08\/19\/video-games-a-matter-of-life-and-death?utm_source=unity3d&utm_medium=blog&utm_campaign=other_global_generalpromo_2016-08-26-Global-bp-blog","image":"https:\/\/unity3d.com\/sites\/default\/files\/ads\/gamechanger_300x107.jpg","target":"_self"}];
window.onload = serveAd;

function serveAd() {
  var data = pickRandomAd();

  var image = document.createElement('img');
  image.src = data["image"];
  image.alt = data["title"];

  var placeholders = document.querySelectorAll('.unity-ad');
  for (var i = 0; i < placeholders.length; ++i) {
    var placeholder = placeholders[i];
    var ad = buildAd(data, placeholder, image);
    placeholder.appendChild(ad);
  }
}

function trackClick(source, title) {
  _gaq.push(['_trackEvent', 'CP ' + title, source]);
}

function pickRandomAd() {
  return ads[Math.floor(Math.random() * ads.length)];
}

function buildAd(data, placeholder, image) {
  
  var source = placeholder.getAttribute('data-source') || buildDefaultSource();

  var tracked_link = data["link"];
  tracked_link += "?utm_source=" + encodeURIComponent(source);
  tracked_link += "&utm_medium=banner";
  tracked_link += "&utm_campaign=" +  encodeURIComponent("CP " + data["title"]);

  var anchor = document.createElement('a');
  anchor.href = tracked_link;
  anchor.appendChild(image);
  anchor.rel = "nofollow";
  anchor.target = data["target"];
  anchor.onclick = function() {
    trackClick(source, data["title"]);
  };

  return anchor;
}

function buildDefaultSource() {
  var defaultSource = window.location.pathname.substring(1);
  defaultSource = defaultSource.replace(/\//g, "_");
  return defaultSource;
}})();