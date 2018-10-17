$(document).ready(async function () {
    isLoggedIn = false;
    await $.get("isLoggedIn", function (data) {
        isLoggedIn = data.body;
    })
    if (isLoggedIn) {
        $("#menu").append(`<input type="button" value="replace the biography" id="replace-biography-button">`);
        $("#menu").append(`<input type="button" value="replace the contact info" id="replace-contact-button">`);
        $("#menu").append(`<input type="button" value="replace the contact picture" id="replace-picture-button">`);
        $("#replace-biography-button").on("click", () => {
            $("#myModal").css("display", "block");
        });
        $("#replace-contact-button").on("click", () => {
            $("#contactModal").css("display", "block");
        });
        $("#replace-picture-button").on("click", () => {
            $("#pictureModal").css("display", "block");
        });
        $("#mainsitenav").append(`<form action="/logout" method="get">
        <input type="submit" value="LOGOUT" />
    </form>`);
    $("#topnavibar").append(`<svg class="newsletter-buttons floaty-spans" viewbox="0 0 100 100"><path d="M 25 30 L 75 30 q 5 0 5 5 L 80 65 q 0 5 -5 5 L 25 70 q -5 0 -5 -5 L 20 35 q 0 -5 5 -5 M 23 33 L 50 50 L 77 33" stroke="#c7c700" stroke-width="5" fill="none" /></svg>`);
    }

   

    $(window).on("click", function (event) {
        if ($(event.target).hasClass("modal")) {
            $(".modal").each(function (element) {
                $(this).css("display", "none");
                $("body").css("overflow", "visible");
            });
        }
        if ($(event.target).hasClass("submodal")) {
            $(event.target).css("display", "none");
        }
    });
    addFunctionality();



    $("#biography-input").bind("change", function () {
        if (!this.files[0])
            return $("#custom-biography-upload-title").html("");
        $("#custom-biography-upload-title").html(this.files[0].name);
        if (this.files[0].size > 1024 * 1024 * 10)//if bigger than 10MB
        {
            alert("the subfile exceeds the 10MB limit\nfile size: " + Math.round(this.files[0].size / 1024 / 1024) + "MB");
            $("#custom-biography-upload-title").html("");
            $(this).val("");
        }
    });
    $("#picture-input").bind("change", function () {
        if (!this.files[0])
            return $("#custom-picture-upload-title").html("");
        $("#custom-picture-upload-title").html(this.files[0].name);
        if (this.files[0].size > 1024 * 1024 * 10)//if bigger than 10MB
        {
            alert("the subfile exceeds the 10MB limit\nfile size: " + Math.round(this.files[0].size / 1024 / 1024) + "MB");
            $("#custom-picture-upload-title").html("");
            $(this).val("");
        }
    });
    $("#contact-input").bind("change", function () {
        if (!this.files[0])
            return $("#custom-contact-upload-title").html("");
        $("#custom-contact-upload-title").html(this.files[0].name);
        if (this.files[0].size > 1024 * 1024 * 10)//if bigger than 10MB
        {
            alert("the subfile exceeds the 10MB limit\nfile size: " + Math.round(this.files[0].size / 1024 / 1024) + "MB");
            $("#custom-contact-upload-title").html("");
            $(this).val("");
        }
    });

    // let bindFileInputToLabel = function (selector) {
    //     if (!this.files[0])
    //         return $(selector).html("");
    //     $(selector).html(this.files[0].name);
    //     if (this.files[0].size > 1024 * 1024 * 10)//if bigger than 10MB
    //     {
    //         alert("the subfile exceeds the 10MB limit\nfile size: " + Math.round(this.files[0].size / 1024 / 1024) + "MB");
    //         $(selector).html("");
    //         $(this).val("");
    //     }
    // }
    // $("#biography-input").bind("change", bindFileInputToLabel("#custom-biography-upload-title"));
    // $("#contact-input").bind("change", bindFileInputToLabel("#custom-contact-upload-title"));
    // $("#picture-input").bind("change", bindFileInputToLabel("#custom-picture-upload-title"));

    $(".biography-form").submit(function (e) {
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
            location.reload();
        });
    });
});

function resizeIframe(obj) {
    if ($(obj).closest(".trailer").css("display") === "none") {
        $(obj).closest(".trailer").css("display", "block");
        $(obj).height($(obj).contents().find("html").height());
        $(obj).closest(".trailer").css("display", "none");
    } else {
        $(obj).height($(obj).contents().find("html").height());
    }
    $(obj).contents().find("head").append(`<base target="_parent">`);
}

function addFunctionality() {
    $(".clickable img").on("click", function (e) {
        $(".trailer").css("display", "none");
        $(".modal").css("display", "none");
        $("#" + $(e.target).parent().attr("id") + "-modal").css("display", "block");
        if (/works/.test(window.location.href)) $("body").css("overflow", "hidden"); // if in /works, disable scrolling of body
        // resizeIframes();
    });
    $("span").on("click", (event) => {
        if ($(event.target).hasClass("close")) {
            $(event.target).parent().parent().css("display", "none");
            $("body").css("overflow", "visible");
        }
        if ($(event.target).hasClass("subclose")) {
            $(event.target).parent().parent().css("display", "none");
        }
    });
}

// $('#topnavibar').load('/html/topnavi.html');