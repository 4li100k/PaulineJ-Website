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
    
    await $.get("get-works-years", function (data) {
        console.log(data);
        if (data.years) {
            data.years.forEach((year) => {
                $("#yearholder").append(`<p onclick="getByYear(this)" year="${year}">${year}</p>`);
            });
        }
    });

    $.get("get-past", function (data) {
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
        }).done(async (data) => {
            console.log(data);
            if (data.err) { return alert(data.err); };
            $("#fileupload").trigger("reset");
            $("#custom-file-upload-title").html("");
            resetContent();
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
let options = {};
options.maindiv = "#undercontent";
options.mainclass = "myWorks";
options.otherclass = " clickable";
options.url = "works";

function getByYear(target) {
    $(".sidemenu p").removeClass("selected");
    $(target).addClass("selected");
    $("#undercontent").children(".myWorks").remove();
    $.get("get-works-by-year", { "year": $(target).attr("year") }, function (data) {
        if (data.err) {
            console.log(data.err);
        }
        console.log(data);
        placeContent(data, options);
    });
}


async function resetContent() {
    $("#yearholder").children().slice(1).remove();
    await $.get("get-works-years", function (data) {
        if (data.years) {
            data.years.forEach((year) => {
                $("#yearholder").append(`<p onclick="getByYear(this)" year="${year}">${year}</p>`);
            });
        }
    });
    $("#yearholder").children().first().click();
    $(".modal").css("display", "none");
}