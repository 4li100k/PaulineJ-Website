$(document).ready(async function () {
    isLoggedIn = false;
    await $.get("isLoggedIn", function (data) {
        isLoggedIn = data.body;
    });
    if (isLoggedIn) {
        $("#upload-anchor").append(`<input type="button" value="add new file" id="add-file-button">`);
        $("#add-file-button").on("click", () => {
            $("#myModal").css("display", "block");
        });
        $("#mainsitenav").append(`<form action="/logout" method="get">
        <input type="submit" value="LOGOUT" />
    </form>`);
    $("#topnavibar").append(`<svg class="newsletter-buttons floaty-spans" viewbox="0 0 100 100"><path d="M 25 30 L 75 30 q 5 0 5 5 L 80 65 q 0 5 -5 5 L 25 70 q -5 0 -5 -5 L 20 35 q 0 -5 5 -5 M 23 33 L 50 50 L 77 33" stroke="#c7c700" stroke-width="5" fill="none" /></svg>`);
    } 
    
    $.get("get-exhibitions", function (data) {
        if (data.err) {
            console.log(data.err);
        }
        console.log(data);
        placeContent(data, options);
    });
    $("#fileupload").submit(function (e) {
        e.preventDefault();
        var formData = new FormData(this);
        $.ajax({
            url: $(this).attr("action"),
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        }).done((data) => {
            console.log(data);
            if (data.err) { return alert(data.err); };
            $("#fileupload").trigger("reset");
            $("#custom-file-upload-title").html("");
            let object = data.object;
            $(options.maindiv).prepend(`<div class="${options.mainclass + options.otherclass}" id="${object._id}"><img class="downloadable" src="../content/${object._id + "." + object.format}"><div class="text">${object.title}</div></div>`);
            if (!object.isVisible) $("#" + object._id).append(`<div class="disabled-overlay">HIDDEN CONTINENT</div>`);
            $("body").prepend(`<div class="modal" id="${object._id}-modal"><div id="${object._id}-content" class="modal-content has-subbutton"><span class="close">X</span><div class="image"><img src="../content/${object._id + "." + object.format}" onload=location.replace("#${object._id}")></div></div></div>`);
            $(".modal").css("display", "none");
            setupSetups(options);
        });
    });
    $("#subfileupload").submit(function (e) {
        e.preventDefault();
        var formData = new FormData(this);
        $.ajax({
            url: $(this).attr("action"),
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        }).done((data) => {
            console.log(data);
            if (data.err) { return alert(data.err); };
            $("#subfileupload").trigger("reset");
            $("#custom-subfile-upload-title").html("");
            placeSubcontent(data.object);
            $(".submodal").css("display", "none");
            setupSetups(options);
        });
    });
});
function getAll(target) {
    $(".sidemenu p").removeClass("selected");
    $(target).addClass("selected");
    $("#undercontent").children(".myExhibitions").remove();
    $.get("get-exhibitions", function (data) {
        if (data.err) {
            console.log(data.err);
        }
        console.log(data);
        placeContent(data, options);
    });
}
function getFuture(target) {
    $(".sidemenu p").removeClass("selected");
    $(target).addClass("selected");
    $("#undercontent").children(".myExhibitions").remove();
    $.get("get-future-exhibitions", function (data) {
        if (data.err) {
            console.log(data.err);
        }
        console.log(data);
        placeContent(data, options);
    });
}
function getPresent(target) {
    $(".sidemenu p").removeClass("selected");
    $(target).addClass("selected");
    $("#undercontent").children(".myExhibitions").remove();
    $.get("get-present-exhibitions", function (data) {
        if (data.err) {
            console.log(data.err);
        }
        console.log(data);
        placeContent(data, options);
    });
}
function getPast(target) {
    $(".sidemenu p").removeClass("selected");
    $(target).addClass("selected");
    $("#undercontent").children(".myExhibitions").remove();
    $.get("get-past-exhibitions", function (data) {
        if (data.err) {
            console.log(data.err);
        }
        console.log(data);
        placeContent(data, options); //comes from shared.js
    });
}

let options = {};
options.maindiv = "#undercontent";
options.mainclass = "myExhibitions";
options.otherclass = " clickable";
options.url = "exhibitions";