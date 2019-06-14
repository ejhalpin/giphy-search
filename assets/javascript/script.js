var customButtonMenu = $("#add-button-menu");
var removeButtonMenu = $("#remove-button-menu");
var newButtonName = $("#button-name");
var newButtonSearchTerm = $("#search-term");
var resultsDiv = $("<div>").attr("id", "results");
var favDiv = $("<div>").attr("id", "favorites");
var display = $("#display");
var container = $(".containter");
var noneDiv = $("#none");
var customButtonMenuShowing = false;
$("#process-add-button").on("click", function() {
  event.preventDefault();

  var newButton = $("<button>");
  newButton.text(newButtonName.val());
  newButton.attr("id", newButtonName.val());
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
$(document).on("click", ".tab", function() {
  var tabs = $(".tab").toArray();
  var name = $(this).attr("data-name");
  $(display.children().get(0)).detach();
  if (name === "results") {
    display.append(resultsDiv);
    display.attr("data-showing", "results");
  } else if (name === "favorites") {
    display.append(favDiv);
    display.attr("data-showing", "favorites");
  } else {
    noneDiv.text("ERROR in tab display");
    display.append(noneDiv);
  }
  for (var i = 0; i < tabs.length; i++) {
    if ($(tabs[i]).hasClass("active-tab")) {
      $(tabs[i]).toggleClass("active-tab");
    }
  }

  $(this).toggleClass("active-tab");
});
$(document).on("click", ".search", fetchGifs);
$(document).on("click", "#stop-play", togglePlay);
$(document).on("click", "#info", toggleInfo);
$(document).on("click", "#embed", toggleEmbed);
$(document).on("click", "#pin", pinToFav);
$("#custom-button-menu").on("click", function() {
  customButtonMenu.toggleClass("visible");
});
$("#clear-results").on("click", function() {
  var showing = display.attr("data-showing");
  if (showing === "results") {
    resultsDiv.empty();
  }
  if (showing === "favorites") {
    favDiv.empty();
  }
});
$("#remove-custom-button-menu").on("click", function() {
  var currentButtons = $("#tray").children();
  var numChild = currentButtons.toArray().length;
  for (var i = 0; i < numChild; i++) {
    var button = $("<button>");
    button.text($(currentButtons.get(i)).text());
    button.attr("data-selected", "0");
    button.addClass("rem");
    button.on("click", function() {
      var sel = parseInt($(this).attr("data-selected"));
      if (sel) $(this).attr("data-selected", "0");
      else $(this).attr("data-selected", "1");
      $(this).toggleClass("selected");
    });
    button.appendTo($("#button-tray"));
  }
  removeButtonMenu.toggleClass("visible");
});

$("#remove-selected").on("click", function() {
  var selectedButtons = $("#button-tray").children();
  var len = selectedButtons.toArray().length;
  for (var i = 0; i < len; i++) {
    var selected = parseInt($(selectedButtons.get(i)).attr("data-selected"));
    var id = $(selectedButtons.get(i)).text();
    if (selected) {
      $("#" + id).remove();
    }
  }
  $("#button-tray").empty();
  removeButtonMenu.toggleClass("visible");
});

$("#remove-all").on("click", function() {
  $("#tray").empty();
  $("#button-tray").empty();
  removeButtonMenu.toggleClass("visible");
});

$("#cancel-remove").on("click", function() {
  $("#button-tray").empty();
  removeButtonMenu.toggleClass("visible");
});

$("input:checkbox").on("change", function() {
  var label = "ratings";
  var alt = "";
  var count = 0;
  $("input:checked").each(function(index, value) {
    count++;
    if (count === 1) {
      alt = $(value).attr("value");
    }
    if (count === 2) {
      alt = alt + " +";
    }
  });
  if (count >= 1 && count < 5) {
    $("#ratings-label").text(alt);
  } else {
    $("#ratings-label").text(label);
  }
});

function fetchGifs() {
  console.log(display.attr("data-showing"));
  var queryStart = "http://api.giphy.com/v1/gifs/search?q=";
  var apiKey = "&api_key=PXSc4twP7Myl2bmlCJngE5Nxx91QMdZz";
  var limit = "&limit=";

  var numRes = parseInt($("select option:selected").val());

  $.ajax({
    url: queryStart + $(this).attr("data-query") + apiKey + limit + numRes,
    method: "GET"
  }).then(function(response) {
    var data = response.data; //an array of objects
    var ratingBoxes = $(".dropdown-form").children();
    var len = ratingBoxes.toArray().length;
    var allowedRatings = [];
    for (var i = 0; i < len; i++) {
      if ($(ratingBoxes.get(i)).prop("checked")) {
        allowedRatings.push($(ratingBoxes.get(i)).attr("value"));
      }
    }
    var temp = [];
    while (data.length > 0) {
      if (allowedRatings.includes(data[0].rating)) {
        temp.push(data.shift());
      } else {
        data.shift();
      }
    }
    data = temp;
    if (data.length == 0) {
      alert("your search did not return any results. Try changing your ratings filters");
    }
    resultsDiv.detach();
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

      var gifBox = $("<div>").addClass("gif");
      gifBox.css("width", size[0] + "px").css("height", size[1] + "px");
      gifBox.css("background-image", "url(" + still + ")");
      gifBox
        .attr("data-image-loop", loop)
        .attr("data-image-still", still)
        .attr("data-loop", "0")
        .attr("data-info", title + "," + rating + "," + gifSize + "," + width + "," + height + "," + frames)
        .attr("data-info-showing", "0")
        .attr("data-embed-tag", embedImageTag)
        .attr("data-embed-showing", "0");

      resultsDiv.append(gifBox);
      addTools(gifBox);
    }
    var maxCols = Math.floor($(window).width() / 300);
    var elems = resultsDiv.children().toArray().length;
    if (elems < maxCols) {
      resultsDiv.css("columns", "300px " + elems);
    } else {
      resultsDiv.css("columns", "300px " + maxCols);
    }
    $(display.children().get(0)).detach();
    display.append(resultsDiv);
    display.attr("data-showing", "results");
    var tabs = $(".tab").toArray();
    for (var i = 0; i < tabs.length; i++) {
      if ($(tabs[i]).hasClass("active-tab")) {
        $(tabs[i]).toggleClass("active-tab");
      }
    }
    $("#gif-search-tab").toggleClass("active-tab");
  });
}

$(document).ready(function() {});

function addTools(gifBox) {
  var tools = $("<div>").addClass("gif-tools");
  var play = $("<div>")
    .attr("id", "stop-play")
    .append('<i class="fas fa-play-circle"></i>');
  var info = $("<div>")
    .attr("id", "info")
    .append('<i class="fas fa-info-circle"></i>');
  var embed = $("<div>")
    .attr("id", "embed")
    .append("&lt;&sol;&gt");
  var pin = $("<div>")
    .attr("id", "pin")
    .append('<i class="fas fa-map-pin"></i>');

  tools
    .append(play)
    .append(info)
    .append(embed)
    .append(pin);

  gifBox.append(tools);
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

function pinToFav() {
  console.log("pinning...");
  var gif = $(
    $(this)
      .parent()
      .parent()
  );

  var newGif = $("<div>");
  newGif
    .css("width", gif.css("width"))
    .css("height", gif.css("height"))
    .attr("data-image-loop", gif.attr("data-image-loop"))
    .attr("data-image-still", gif.attr("data-image-still"))
    .attr("data-loop", gif.attr("data-loop"))
    .attr("data-info", gif.attr("data-info"))
    .attr("data-info-showing", gif.attr("data-info-showing"))
    .attr("data-embed-tag", gif.attr("data-embed-tag"))
    .attr("data-embed-tag-showing", gif.attr("data-embed-tag-showing"))
    .css("background-image", gif.css("background-image"))
    .addClass("gif");

  addTools(newGif);
  favDiv.append(newGif);
  var maxCols = Math.floor($(window).width() / 300);
  var elems = favDiv.children().toArray().length;
  if (elems < maxCols) {
    favDiv.css("columns", "300px " + elems);
  } else {
    favDiv.css("columns", "300px " + maxCols);
  }
}

$("#expand").on("click", function() {
  var expand = $(this);
  var downChev = '<i class="fas fa-caret-down"></i>';
  var upChev = '<i class="fas fa-caret-up"></i>';
  var state = parseInt($(this).attr("data-expand")); //0 is collapsed, 1 is expanded
  if (state) {
    $("#dropdown").animate({ height: "0px" }, 200);
    expand.attr("data-expand", "0");
    $(this)
      .empty()
      .append(downChev);
  } else {
    $("#dropdown").animate({ height: "100px" }, 200);
    expand.attr("data-expand", "1");
    $(this)
      .empty()
      .append(upChev);
  }
});
