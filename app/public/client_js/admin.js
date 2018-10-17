
$(document).ready(async function () {

    let isLoggedIn = false;
    $.get("isLoggedIn", function (res) {
        if (res.body === "true") {
            isLoggedIn = true;
            $("#navbar").append(`<input type="button" value="add new file" id="add-file-button">`);
            $("#navbar").append(`<input type="button" value="broadcast here" id="broadcast-button">`);
            // $("#navbar").append(`<input type="button" value="subscribe here" id="newsletter-button">`);
            $("#navbar").append(`<a href="/logout">LOGOUT</a>`);
            $("#add-file-button").on("click", () => {
                $("#myModal").css("display", "block");
            });
            $("#broadcast-button").on("click", () => {
                $("#broadcastModal").css("display", "block");
            });
        } else {
            $("#navbar").append(`<input type="button" value="subscribe here" id="newsletter-button">`);
            $("#navbar").append(`<a href="/login">LOGIN</a>`);
            $("#newsletter-button").on("click", () => {
                $("#newsletterModal").css("display", "block");
            });
        }
    });

    // upload stuff
    $("#file-input").change(function () {
        var fileName = $(this).val().split(/(\\|\/)/g).pop().split(".")[0];
        $("#title-input").val(fileName);
    });
    
    
    $(window).on("click", function (event) {
        if ($(event.target).hasClass("modal")) {
            $(".modal").each(function (element) {
                $(this).css("display", "none");
            });
        }
    });
    $("span").on("click", (event) => {
        if ($(event.target).hasClass("close")) {
            $(".modal").each(function (element) {
                $(this).css("display", "none");
            });
        }
    });

   

    $("#newsletterForm").submit(function (event) {
        event.preventDefault(); //doesn't reload the page on submit
        var name = $("#name-input").val();
        var email = $("#email-input").val();
        var data = {
            "name": name,
            "email": email
        }
        $.ajax({
            type: "POST",
            url: "subscribe",   //dont include first slash OR ELSE
            data: data,
        }).done(function (response) {
            if (response.err) {
                console.log(response.err);
            } else {
                console.log(response.msg);
            }
        });
    });

    $("#broadcastForm").submit(function (event) {
        console.log("broadcasting");
        event.preventDefault(); //doesn't reload the page on submit
        var subject = $("#subject-input").val();
        var message = $("#message-input").val();
        var data = {
            "subject": subject,
            "message": message
        }
        $.ajax({
            type: "POST",
            url: "broadcast",   //dont include first slash OR ELSE
            data: data,
        }).done(function (res) {
            if (res.err) {
                alert(res.err);
                console.log(res.err);
            } else {
                location.assign("/");
            }
        });
    });

    //load stuff
    var emptyLoad = false; //after this becomes true, it won't load anymore
    var scrollingEnabled = false;
    var gettingContent = false;
    var getContent = function (amount) {
        return new Promise(function (resolve, reject) {
            if (gettingContent) { return resolve("busy"); }
            gettingContent = true;
            if (emptyLoad) {
                console.log("no more data");
                $("#viewport-check").hide();
                return resolve("no more data");
            }
            var loaded = $(".content").length;
            $.get("get-content", { "loaded": loaded, "requesting": amount }, function (data) {
                console.log("requesting data");
                if (data.err) {
                    console.log(data.err);
                    return resolve(data.err);
                }
                console.log(data);
                if (data.descriptions.length < 1) {
                    emptyLoad = true;
                    console.log("no more data, hiding the loader");
                    $("#viewport-check").hide();
                    return resolve("empty load");
                }
                data.descriptions.forEach(object => {
                    var attrName = object.title;
                    var name = object.title + "." + object.format;
                    var imgFormats = ["jpg", "jpeg", "png", "gif", "bmp"];
                    var audioFormats = ["wav"];
                    var videoFormats = ["mp4"];
                    if (imgFormats.includes(object.format))
                        $("#main").append(`<div class="row content pic" id="${attrName}"><img width="450px" height="450px" src="content/${name}"></div>`);
                    if (audioFormats.includes(object.format))
                        $("#main").append(`<div class="row content" id="${attrName}"><audio controls controlsList="nodownload"><source src="content/${name}" type="audio/mpeg">Your browser does not support the audio element.</audio></div>`);
                    if (videoFormats.includes(object.format))
                        $("#main").append(`<div class="row content" id="${attrName}"><video controls controlsList="nodownload" height="300"><source src="content/${name}" type="video/mp4">Your browser does not support the video element.</video></div>`);
                    if (isLoggedIn) {
                        $("span").remove(".delete-buttons");
                        $(".content").each(function (i, obj) {
                            $(obj).prepend(`<span class=\"delete-buttons\" id=\"${$(this).attr("id")}\">&times;</span>`)
                        });
                        $(".delete-buttons").on("click", (event) => {
                            data = { "title": $(event.target).attr("id") }
                            $.ajax({
                                type: "POST",
                                url: "delete-content",
                                data: data
                            }).done(function (res) {
                                if (res.err) {
                                    alert(res.err);
                console.log(res.err);
                                } else {
                                    location.assign("/");
                                }
                            });
                        });
                    }
                });
                if ($("#viewport-check").isInViewport()) {
                    gettingContent = false;
                    getContent(1);
                } else {
                    if (!scrollingEnabled) {
                        $(window).on("scroll", _.throttle(
                            function () {
                                if ($("#viewport-check").isInViewport()) {
                                    getContent(1);
                                }
                            }, 100
                        ));
                    }
                    gettingContent = false;
                }
                resolve("ok");

            });
        });
    }


    var promise1 = new Promise(function (resolve, reject) {
        setTimeout(resolve, 100);
    });
    await promise1.then(() => {
        $(document.body).append("<div id=\"viewport-check\" class=\"lds-dual-ring\"></div>");
    }).catch(() => {
        console.log("rejected");
    });
    $.fn.isInViewport = function () { // returns TRUE if the element is visible on page (display:none is still visible)
        var elementTop = $(this).offset().top;
        var elementBottom = elementTop + $(this).outerHeight();
        var viewportTop = $(window).scrollTop();
        var viewportBottom = viewportTop + $(window).height();
        return elementBottom > viewportTop && elementTop < viewportBottom;
    };
    if ($("#viewport-check").isInViewport()) { // loads something upon first load
        getContent(1);
    };
});