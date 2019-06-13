var customButtonMenu = $("#add-button-menu");
var newButtonName = $("#button-name");
var newButtonSearchTerm = $("#search-term");
var resultsDiv = $("#results");
var container = $(".containter");
var customButtonMenuShowing = false;
$("#process-add-button").on("click", function() {
  event.preventDefault();

  var newButton = $("<button>");
  newButton.text(newButtonName.val());
  newButton.attr("data-query", newButtonSearchTerm.val());
  newButton.addClass("search");
  $("#tray").append(newButton);
  customButtonMenu.toggleClass("visible");
  newButtonName.val("");
  newButtonSearchTerm.val("");
});

$("#cancel-add-button").on("click", function() {
  newButtonName.val("");
  newButtonSearchTerm.val("");
  customButtonMenu.toggleClass("visible");
});

$(document).on("click", ".search", fetchGifs);
$(document).on("click", "#stop-play", togglePlay);
$(document).on("click", "#info", toggleInfo);
$(document).on("click", "#embed", toggleEmbed);
$("#custom-button-menu").on("click", function() {
  console.log("show menu");
  customButtonMenu.toggleClass("visible");
});
$("#clear-results").on("click", function() {
  resultsDiv.empty();
});

function fetchGifs() {
  var queryStart = "http://api.giphy.com/v1/gifs/search?q=";
  var apiKey = "&api_key=PXSc4twP7Myl2bmlCJngE5Nxx91QMdZz";
  var limit = "&limit=";

  $.ajax({
    url: queryStart + $(this).attr("data-query") + apiKey + limit + "10",
    method: "GET"
  }).then(function(response) {
    var data = response.data; //an array of objects
    for (var i = 0; i < data.length; i++) {
      var size = [parseInt(data[i].images.original.width), parseInt(data[i].images.original.height)];

      if (Math.max(size[0], size[1]) > 300) {
        size = scaleDimensions(size);
      }
      //stop-play urls
      var loop = data[i].images.original.url;
      var still = data[i].images.original_still.url;
      //info
      var frames = data[i].images.original.frames;
      var width = data[i].images.original.width;
      var height = data[i].images.original.height;
      var gifSize = data[i].images.original.size;
      var rating = data[i].rating;
      var title = data[i].title;
      //embed
      var embedImageTag = "<img src='" + data[i].embed_url + "' alt='" + title + "'></img>";

      var div = gifBoxConstructor(size);
      div.css("background-image", "url(" + loop + ")");
      div
        .attr("data-image-loop", loop)
        .attr("data-image-still", still)
        .attr("data-loop", "1")
        .attr("data-info", title + "," + rating + "," + gifSize + "," + width + "," + height + "," + frames)
        .attr("data-info-showing", "0")
        .attr("data-embed-tag", embedImageTag)
        .attr("data-embed-showing", "0");

      resultsDiv.append(div);
    }
  });
}

$(document).ready(function() {});

function gifBoxConstructor(size = [0, 0]) {
  var gifBox = $("<div>").addClass("gif");

  var tools = $("<div>").addClass("gif-tools");
  var play = $("<div>")
    .attr("id", "stop-play")
    .append('<i class="fas fa-stop-circle"></i>');
  var info = $("<div>")
    .attr("id", "info")
    .append('<i class="fas fa-info-circle"></i>');
  var embed = $("<div>")
    .attr("id", "embed")
    .append("&lt;&sol;&gt");

  tools
    .append(play)
    .append(info)
    .append(embed);

  gifBox.append(tools);
  gifBox.css("width", size[0] + "px").css("height", size[1] + "px");
  gifBox.on("mouseenter", function() {
    var tooltray = $(
      $(this)
        .children()
        .get(0)
    );

    tooltray.animate({ height: "20px" }, 500);
  });
  gifBox.on("mouseleave", function() {
    var tooltray = $(
      $(this)
        .children()
        .get(0)
    );
    var infoShowing = parseInt($(this).attr("data-info-showing"));
    var embedShowing = parseInt($(this).attr("data-embed-showing"));
    tooltray.animate({ height: "0px" }, 500, function() {
      if (infoShowing) {
        $(".info-display").remove();
        gifBox.attr("data-info-showing", "0");
      }
      if (embedShowing) {
        $(".embed-display").remove();
        gifBox.attr("data-embed-showing", "0");
      }
    });
  });

  return gifBox;
}

function scaleDimensions(size = [0, 0]) {
  var w = size[0];
  var h = size[1];
  //find the ratio w:h
  var ratio = size[0] / size[1];

  if (w > h) {
    w = 300;
    h = w / ratio;
  } else if (w < h) {
    h = 300;
    w = ratio * h;
  } else {
    w = h = 300;
  }

  return [w, h];
}

function togglePlay() {
  var playIcon = '<i class="fas fa-play-circle"></i>';
  var stopIcon = '<i class="fas fa-stop-circle"></i>';
  var gif = $(
    $(this)
      .parent()
      .parent()
  );
  var looping = parseInt(gif.attr("data-loop"));

  if (looping) {
    gif.css("background-image", "url(" + gif.attr("data-image-still") + ")");
    gif.attr("data-loop", "0");
    $(this)
      .empty()
      .append(playIcon);
  } else {
    gif.css("background-image", "url(" + gif.attr("data-image-loop") + ")");
    gif.attr("data-loop", "1");
    $(this)
      .empty()
      .append(stopIcon);
  }
}

function toggleInfo() {
  var gif = $(
    $(this)
      .parent()
      .parent()
  );

  var tooltray = $($(this).parent());

  var infoShowing = parseInt(gif.attr("data-info-showing"));
  if (!infoShowing) {
    var infoLabels = ["title: ", "rating: ", "size: ", "width: ", "height: ", "frames: "];
    var infoArray = gif.attr("data-info").split(",");
    var div = $("<div>");
    div.addClass("info-display");
    for (var i = 0; i < infoArray.length; i++) {
      var p = $("<p>");
      p.text(infoLabels[i] + infoArray[i]);
      div.append(p);
    }
    tooltray.append(div);
    tooltray.animate({ height: "100%" }, 500);
    gif.attr("data-info-showing", "1");
  } else {
    tooltray.animate({ height: "20px" }, 500, function() {
      $(".info-display").remove();
      gif.attr("data-info-showing", "0");
    });
  }
}

function toggleEmbed() {
  var gif = $(
    $(this)
      .parent()
      .parent()
  );

  var tooltray = $($(this).parent());

  var embedShowing = parseInt(gif.attr("data-embed-showing"));
  if (!embedShowing) {
    var div = $("<div>");
    div.addClass("embed-display");
    div.append($("<p>").text(gif.attr("data-embed-tag")));
    tooltray.append(div);
    tooltray.animate({ height: "100%" }, 500);
    gif.attr("data-embed-showing", "1");
  } else {
    tooltray.animate({ height: "20px" }, 500, function() {
      $(".embed-display").remove();
      gif.attr("data-embed-showing", "0");
    });
  }
}
