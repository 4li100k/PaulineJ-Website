$(document).ready(async function () {
    isLoggedIn = false;
    await $.get("isLoggedIn", function (data) {
        isLoggedIn = data.body;
    });
    if (isLoggedIn) {
        $("#upload-anchor").append(`<input type="button" class="index-upload" value="add new file" id="add-file-button">`);
        $("#add-file-button").on("click", () => {
            $("#myModal").css("display", "block");
        });
        $("#mainsitenav").append(`<form action="/logout" method="get">
            <input type="submit" value="LOGOUT" />
        </form>`);

        $("#topnavibar").append(`<svg class="newsletter-buttons floaty-spans" viewbox="0 0 100 100"><path d="M 25 30 L 75 30 q 5 0 5 5 L 80 65 q 0 5 -5 5 L 25 70 q -5 0 -5 -5 L 20 35 q 0 -5 5 -5 M 23 33 L 50 50 L 77 33" stroke="#c7c700" stroke-width="5" fill="none" /></svg>`);
    
    }

  
    $.get("get-ongoing", function (data) {
        if (data.err) {
            console.log(data.err);
        }
        console.log(data);
        placeContent(data, options);
        // let highestImage = 0;
        // $(".mySlides>img").each(function (i, obj) {
        //     $(this).on("load", function () {
        //         // $(this).attr("display", "block");
        //         console.log($(this).attr("display"));
        //         console.log($(this).height());
        //         if ($(this).height() > highestImage) {
        //             highestImage = $(this).height();
        //             $("#ongoing-div").height(highestImage + 30);
        //         }

        //     });
        // });

    });

    $("#loginForm").submit(function(e){
        e.preventDefault();
        
        var username = $("#usernameField").val();
        var password = $("#passwordField").val();
        var data = {
            "username": username,
            "password": password
        }

        $.ajax({
            type: "POST",
            url: "loginUser",   //dont include first slash OR ELSE
            data: data,
        }).done(function(response) {
            if(response === "success")
                window.location.assign("chat");
            else
                $("#err").text("wrong username or password");
        });    

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
            if (object.text)
                object.text = object.text.replace(/ /g, "&nbsp;").replace(/(?:\r\n|\r|\n)/g, "<br>");
            $(options.maindiv).prepend(`<div class="${options.mainclass + options.otherclass}" id="${object._id}"><img class="downloadable" src="../content/${object._id + "." + object.format}">
            <div class="poem-overlay"><div class="poem-container"><p class="line-1 anim-typewriter poem">${object.text}</p><div></div>
                                            <div class="text">${object.title}</div>
                                        </div>`);
            if (!object.isVisible) $("#" + object._id).append(`<div class="disabled-overlay">HIDDEN CONTINENT</div>`);
            $("#undercontent").prepend(`<div class="trailer" id="${object._id}-modal"><div id="${object._id}-content" class="trailer-content has-subbutton"><div class="image"></div></div></div>`);
            $("#navdot-div").append(`<span class="dot" onclick="currentSlide(${$(".dot").length + 1})"></span>`);
            $(".modal").css("display", "none");
            setupSetups(options);
            showSlides(1);
            $(".anim-typewriter").each(function (i, obj) {
                $(this).css("animation-duration", `${Math.round($(this).text().length * 100)}ms, 500ms`);
                console.log($(this).css("animation-duration"));
            });
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
options.maindiv = "#ongoing-div";
options.mainclass = "mySlides";
options.otherclass = " fade clickable";
options.url = "index";

// for poem typing effect
