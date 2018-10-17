$(document).ready(async function () {
    $("*").attr("onclick");

    $("body").prepend(`<div id="NewsletterModal" class="modal">
    <div class="modal-content">
        <svg class="floaty-span subclose" viewbox="0 0 100 100">
            <path d="M 20 20 L 80 80 M 20 80 L 80 20" stroke="#646464" stroke-width="5" fill="none" />
        </svg>
        <form id="broadcastForm" action="broadcastForm" method="post" enctype="multipart/form-data">
            <label for="broadcast-input" class="custom-file-upload">
                <i class="fa fa-cloud-upload"></i> ZIP file
            </label>
            <p id="custom-broadcast-upload-title"></p>
            <input type="file" name="filetoupload" id="broadcast-input" autocomplete="off">
            <br>
            <input type="text" placeholder="subject" name="subject" id="subject-input" autocomplete="off" required>
            <br>
            <br>
            <br>
            <input type="submit" value="Send">
        </form>
    </div>
</div>`);

    $("#newsletterForm").submit(function (event) {
        let name = $("#name-input").val();
        let email = $("#email-input").val();
        let data = {
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

    $("#submitDetails").click(function(event){
        event.preventDefault(); //doesn't reload the page on submit
        
        var username = $("#username").val();
        var password = $("#password").val();
                
        var data = {
            "username": username,
            "password": password
        }
        
        $.ajax({
            type: "POST",
            url: "loginUser",   //dont include first slash OR ELSE
            data: data,
        }).done(function (response) {
            if (response.err) {
                console.log(response.err);
                alert(response.err);
            } else {
                console.log(response.msg);      
                location.assign("/");
            }
        });
    });

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
    $("#file-input").bind("change", function () {
        if (!this.files[0])
            return $("#custom-file-upload-title").html("");
        $("#custom-file-upload-title").html(this.files[0].name);
        if (this.files[0].size > 1024 * 1024 * 10)//if bigger than 10MB
        {
            alert("the file exceeds the 10MB limit\nfile size: " + Math.round(this.files[0].size / 1024 / 1024) + "MB");
            $("#custom-file-upload-title").html("");
            $(this).val("");
        }
    });
    $("#subfile-input").bind("change", function () {
        if (!this.files[0])
            return $("#custom-subfile-upload-title").html("");
        $("#custom-subfile-upload-title").html(this.files[0].name);
        if (this.files[0].size > 1024 * 1024 * 10)//if bigger than 10MB
        {
            alert("the subfile exceeds the 10MB limit\nfile size: " + Math.round(this.files[0].size / 1024 / 1024) + "MB");
            $("#custom-subfile-upload-title").html("");
            $(this).val("");
        }
    });
    for (i = new Date().getFullYear(); i > 1960; i--) {
        $('#yearpicker').append($('<option />').val(i).html(i));
    }
});// end of $(document).ready()

// function placeLoginForm(){
//     $("#mainsitenav").append(`<button id="LoginFormBtn" onclick="document.getElementById('login').style.display='block'">LOGIN</button>
//     <div id="login" class="modal">

//             <form id="loginForm" class="modal-content animate " action="index.html" method="POST">
            
//               <div class="container">
//                 <label for="uname"><b>Username</b></label>
//                 <input type="text" id="username" placeholder="Enter Username" name="uname" required>
          
//                 <label for="psw"><b>Password</b></label>
//                 <input type="password" id="password" placeholder="Enter Password" name="psw" required>
                
//               </div>
//               <br>
//               <div>
//                     <input type="submit" id="submitDetails" value="LOGIN" />
//               </div>
             
//             </form>
//     </div>`);

//    
// }

function placeBroadcastForm() {
    $("#newsletter").append(`
            <div id="broadcastBox">
                <p><b>send message to subscribers</b></p>
                <form id="broadcastForm">
                    <input type="text" placeholder="subject" name="subject" id="subject-input" autocomplete="off" required>
                    <br>
                    <input type="text" placeholder="message" name="message" id="message-input" autocomplete="off" required>
                    <br>
                    <input type="submit" value="broadcast now">
                </form>
            </div>
        `);
    $("#broadcastForm").submit(function (event) {
        console.log("broadcasting");
        let subject = $("#subject-input").val();
        let message = $("#message-input").val();
        let data = {
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

}
function addFunctionality() {
    $(".clickable").hover(
        function (e) {
            $(e.target).addClass("hovering");
        }, function (e) {
            $(e.target).removeClass("hovering");
        }
    );
    $(".clickable img").on("click", function (e) {
        if (!$(e.target).hasClass("hovering")) { return; }
        $(".trailer").css("display", "none");
        $(".modal").css("display", "none");
        $("#" + $(e.target).parent().attr("id") + "-modal").css("display", "block");
        if (/works/.test(window.location.href) || /exhibitions/.test(window.location.href)) $("body").css("overflow", "hidden"); // if in /works or /exhibitions, disable scrolling of body
    });
    $("span, svg").on("click", (event) => {
        if ($(event.target).hasClass("close")) {
            $(event.target).parent().parent().css("display", "none");
            $("body").css("overflow", "visible");
        }
        if ($(event.target).hasClass("subclose")) {
            $(event.target).parent().parent().css("display", "none");
        }
    });
    $(".newsletter-buttons").on("click", function () {
        $("#NewsletterModal").css("display", "block");
    });
    $("#broadcast-input").bind("change", function () {
        if (!this.files[0])
            return $("#custom-broadcast-upload-title").html("");
        $("#custom-broadcast-upload-title").html(this.files[0].name);
        if (this.files[0].size > 1024 * 1024 * 10)//if bigger than 10MB
        {
            alert("the subfile exceeds the 10MB limit\nfile size: " + Math.round(this.files[0].size / 1024 / 1024) + "MB");
            $("#custom-broadcast-upload-title").html("");
            $(this).val("");
        }
    });
    $("#broadcastForm").submit(function (e) {
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
            // alert that e-mail has been sent successfully and close the form
            $(this).trigger("reset");
            $("#custom-broadcast-upload-title").html("");
            $("#NewsletterModal").css("display", "none");
        });
    });
}
// function setupDownloadButtons() {
//     $(".download-buttons").remove();
//     $(".downloadable").each(function (i, obj) {
//         $(obj).parent().append(`<a href="${$(this).attr("src")}" class="" download><svg class="download-buttons floaty-spans hidden-by-default" viewbox="0 0 100 100">
//         <path d="M 20 60 L 20 70 q 0 10 10 10 L 70 80 q 10 0 10 -10 L 80 60 M 40 20 L 60 20 L 60 40 L 70 40 L 50 65 L 30 40 L 40 40 L 40 20 L 60 20" stroke="#000000" stroke-width="5" fill="none" />
//         </svg></a>`);
//     });
// }
function setupAddSubcontentButtons() {
    $(".subform-button").remove();
    $(".container-button").remove();
    $(".subsubform-button").remove();
    $("body").prepend(`
    <div id="subsubModal" class="submodal">
        <div class="modal-content">
            <svg class="floaty-span subclose" viewbox="0 0 100 100">
                <path d="M 20 20 L 80 80 M 20 80 L 80 20" stroke="#646464" stroke-width="5" fill="none" />
            </svg>
            <form id="subsubfileupload" action="subsubfileupload" method="post" enctype="multipart/form-data">
                <label for="subsubfile-input" class="custom-file-upload">
                    <i class="fa fa-cloud-upload"></i> JPG, JPEG, PNG, GIF, BMP file
                </label>
                <p id="custom-subsubfile-upload-title"></p>
                <input type="file" name="filetoupload" id="subsubfile-input" autocomplete="off">
                <br>
                <br>
                <input class="hidden" type="text" placeholder="dependency" name="dependency" id="subdependency-input" autocomplete="off" readonly>
                <br>
                <input type="submit">
            </form>
        </div>
    </div>`);
    $("#subsubfileupload").submit(function (e) {
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
            if (data.err) return alert(data.err);
            let subsubobject = data.object;
            let subobject = subsubobject.parent;
            $("#" + subobject._id + "-content").append(`<div class="subsubobject" id="${subsubobject._id}"><img class="downloadable" src="../subsubcontent/${subsubobject._id + "." + subsubobject.format}" onload=location.replace("#${subsubobject._id}")></div>`);
            $(".submodal").css("display", "none");
            setupSetups(options);
        });
    });
    $("#subsubfile-input").bind("change", function () {
        console.log("subsubfile changed");
        $("#custom-subsubfile-upload-title").html(this.files[0].name);
        if (this.files[0].size > 1024 * 1024 * 10)//if bigger than 10MB
        {
            alert("the subsubfile exceeds the 10MB limit\nfile size: " + Math.round(this.files[0].size / 1024 / 1024) + "MB");
            $("#custom-subsubfile-upload-title").html("");
            $(this).val("");
        }
    });
    $(".has-subbutton").each(function (i, obj) {
        $(obj).prepend(`<input type="button" class="subform-button" value="add subcontent"></input>`);
        $(obj).prepend(`<input type="button" class="container-button" value="add container"></input>`);
    });
    $(".has-subsubbutton").each(function (i, obj) {
        $(obj).prepend(`<input type="button" class="subsubform-button" value="add subsubcontent"></input>`);
    });
    $(".subform-button").on("click", function (e) {
        $("#subModal").css("display", "block");
        $("#dependency-input").val(
            $("#" + $(e.target).parent().parent().attr("id")).attr("id").slice(0, -6) // why am i stupid?
        );
    });
    $(".subsubform-button").on("click", function (e) {
        $("#subsubModal").css("display", "block");
        $("#subdependency-input").val(
            $(e.target).parent().attr("id")
        );
    });
    $(".container-button").on("click", function (e) {
        let data = {
            "dependency": $(e.target).parent().parent().attr("id").slice(0, -6)
        }
        $.ajax({
            type: "POST",
            url: "containerupload",   //dont include first slash OR ELSE
            data: data,
        }).done(function (res) {
            if (res.err) {
                alert(res.err);
                console.log(res.err);
            } else if (res.status === 200) {
                let subobject = res.object;
                let object = subobject.parent;
                $("#" + object._id + "-content").append(`<div class="subobject has-subsubbutton" id="${subobject._id}"><div id="${subobject._id}-content" class="container-object"></div></div>`);
                setupSetups(options);
            }
        });
    });
}

function setupChangeStatusButtons(status) {
    $(".status-buttons").remove();
    let selector;
    if (status === "past") selector = ".mySlides";
    else if (status === "ongoing") selector = ".myWorks";
    $(selector).each(function (i, obj) {
        // $(obj).append(`<span class="status-buttons floaty-spans hidden-by-default" target="${$(this).attr("id")}" status="${status}">move to ${status}</span>`);
        $(obj).append(`<svg class="status-buttons floaty-spans hidden-by-default" target="${$(this).attr("id")}" status="${status}" viewbox="0 0 100 100">
        <path class="negative" d="M 20 30 q 0 -10 10 -10 L 70 20 q 10 0 10 10 L 80 70 q 0 10 -10 10 L 30 80 q -10 0 -10 -10 L 20 30 q 0 -10 10 -10 M 20 40 L 80 40 M 40 50 L 60 50" stroke="#000000" stroke-width="5" fill="none"/>
    
    </svg>`);

    });
    $(".status-buttons").on("click", (event) => {
        console.log("changing status");
        data = {
            "id": $(event.target).attr("target"),
            "status": $(event.target).attr("status")
        }
        $.ajax({
            type: "POST",
            url: "changeStatus",
            data: data
        }).done(function (res) {
            if (res.err) {
                alert(res.err);
                console.log(res.err);
            } else if (res.status === 200) {
                $("#" + $(event.target).attr("target")).remove();
                $("#" + $(event.target).attr("target") + "-modal").remove();
                if (options.url === "index") {
                    $("#navdot-div").children()[$("#navdot-div").children().length - 1].remove();
                    if ($(".mySlides").length > 0)
                        plusSlides(0);
                    else
                        $(".prev, .next").remove();
                }
                if (options.url === "works") {
                    resetContent();
                }
            }
        });
    });
}

function setupToggleVisibilityButtons(status) {
    $(".visibility-buttons").remove();
    let selector;
    if (status === "mySlides") selector = ".mySlides";
    else if (status === "myWorks") selector = ".myWorks";
    else if (status === "myExhibitions") selector = ".myExhibitions";
    $(selector).each(function (i, obj) {
        // $(obj).append(`<span class="visibility-buttons floaty-spans" target="${$(this).attr("id")}">toggle visibility</span>`);
        $(obj).append(`<svg class="visibility-buttons floaty-spans hidden-by-default" target="${$(this).attr("id")}" viewbox="0 0 100 100">
        <path d="M 20 50 q 30 30 60 0 q -30 -30 -60 0 q 30 30 60 0" stroke="#000000" stroke-width="5" fill="none" />
        <circle cx="50" cy="50" r="10" stroke="#000000" stroke-width="2" fill="white"/>
        <circle cx="50" cy="50" r="10"  fill="#000000"/>
        <line x1="30%" y1="80%" x2="70%" y2="20%" style="stroke:#ffffff;stroke-width:5" />
        <line x1="34%" y1="80%" x2="74%" y2="20%" style="stroke:#000000;stroke-width:5" />
    </svg>`);
    });
    $(".visibility-buttons").on("click", (event) => {
        console.log("changing visibility");
        data = {
            "id": $(event.target).attr("target")
        }
        $.ajax({
            type: "POST",
            url: "toggleVisibility",
            data: data
        }).done(function (res) {
            if (res.err) {
                alert(res.err);
                console.log(res.err);
            } else if (res.status === 200) {
                let object = res.object;
                if (!object.isVisible) $("#" + object._id).append(`<div class="disabled-overlay">HIDDEN CONTINENT</div>`);
                else $("#" + object._id).find(".disabled-overlay").remove();
            }
        });
    });
}
function setupSwapPositionButtons() {
    $(".swap-subbuttons").remove();
    $(".swap-subsubbuttons").remove();
    $(".subobject").each(function (i, obj) {
        $(obj).append(`<svg class="swap-subbuttons floaty-spans hidden-by-default" target="${$(this).attr("id")}" direction="up"><line x1="20%" y1="80%" x2="50%" y2="20%" style="stroke:#ffffff;stroke-width:3" /><line x1="50%" y1="20%" x2="80%" y2="80%" style="stroke:#ffffff;stroke-width:3" /></svg>`);
        $(obj).append(`<svg class="swap-subbuttons floaty-spans hidden-by-default" target="${$(this).attr("id")}" direction="down"><line x1="20%" y1="20%" x2="50%" y2="80%" style="stroke:#ffffff;stroke-width:3" /><line x1="50%" y1="80%" x2="80%" y2="20%" style="stroke:#ffffff;stroke-width:3" /></svg>`);
    });
    $(".subsubobject").each(function (i, obj) {
        $(obj).append(`<svg class="swap-subsubbuttons floaty-spans hidden-by-default" target="${$(this).attr("id")}" direction="up"><line x1="80%" y1="20%" x2="20%" y2="50%" style="stroke:#ffffff;stroke-width:3" /><line x1="20%" y1="50%" x2="80%" y2="80%" style="stroke:#ffffff;stroke-width:3" /></svg>`);
        $(obj).append(`<svg class="swap-subsubbuttons floaty-spans hidden-by-default" target="${$(this).attr("id")}" direction="down"><line x1="20%" y1="20%" x2="80%" y2="50%" style="stroke:#ffffff;stroke-width:3" /><line x1="80%" y1="50%" x2="20%" y2="80%" style="stroke:#ffffff;stroke-width:3" /></svg>`);
    });
    $(".swap-subbuttons").on("click", (event) => {
        data = {
            "id": $(event.target).attr("target"),
            "direction": $(event.target).attr("direction"),
            "collection": "subcontent",
            "filter": "dependency"
        }
        $.ajax({
            type: "POST",
            url: "swap",
            data: data
        }).done(function (res) {
            if (res.err) {
                alert(res.err);
                console.log(res.err);
            } else if (res.status === 200) {
                let target = $(event.target).parent();
                let parentDiv = $(target).parent();
                let childrenDivs = $(parentDiv).children(".subobject");

                if (childrenDivs.length === 1) { return location.replace("#" + $(target).attr("id")); };//otherwise the object just disappears without reappearing
                if ($(event.target).attr("direction") === "up") {
                    if (target[0] == $(childrenDivs[0])[0]) {
                        $(target).detach().insertAfter(childrenDivs[childrenDivs.length - 1]);//works
                    } else {
                        let targetIndex = -1;
                        childrenDivs.each(function (i, obj) {
                            if ($(obj)[0] == target[0]) targetIndex = i;
                        });
                        if (targetIndex > -1)
                            $(target).detach().insertBefore("#" + $(childrenDivs[targetIndex - 1]).attr("id"));//doesnt work
                        else console.log("error moving up");
                    }
                } else {
                    if (target[0] == $(childrenDivs[childrenDivs.length - 1])[0]) {
                        $(target).detach().insertBefore(childrenDivs[0]);
                    } else {
                        let targetIndex = -1;
                        childrenDivs.each(function (i, obj) {
                            if ($(obj)[0] == target[0]) targetIndex = i;
                        });
                        if (targetIndex > -1)
                            $(target).detach().insertAfter(childrenDivs[targetIndex + 1]);
                        else console.log("error moving down");
                    }
                }
                location.replace("#" + $(target).attr("id"));
            }
        });
    });
    $(".swap-subsubbuttons").on("click", (event) => {
        data = {
            "id": $(event.target).attr("target"),
            "direction": $(event.target).attr("direction"),
            "collection": "subsubcontent",
            "filter": "dependency"
        }
        $.ajax({
            type: "POST",
            url: "swap",
            data: data
        }).done(function (res) {
            if (res.err) {
                alert(res.err);
                console.log(res.err);
            } else if (res.status === 200) {
                let target = $(event.target).parent();
                let parentDiv = $(target).parent();
                let childrenDivs = $(parentDiv).children(".subsubobject");
                if (childrenDivs.length === 1) { return; };//otherwise the object just disappears without reappearing
                if ($(event.target).attr("direction") === "up") {
                    if (target[0] == $(childrenDivs[0])[0]) {
                        $(target).detach().insertAfter(childrenDivs[childrenDivs.length - 1]);//works
                    } else {
                        let targetIndex = -1;
                        childrenDivs.each(function (i, obj) {
                            if ($(obj)[0] == target[0]) targetIndex = i;
                        });
                        if (targetIndex > -1)
                            $(target).detach().insertBefore("#" + $(childrenDivs[targetIndex - 1]).attr("id"));//doesnt work
                        else console.log("error moving up");
                    }
                } else {
                    if (target[0] == $(childrenDivs[childrenDivs.length - 1])[0]) {
                        $(target).detach().insertBefore(childrenDivs[0]);
                    } else {
                        let targetIndex = -1;
                        childrenDivs.each(function (i, obj) {
                            if ($(obj)[0] == target[0]) targetIndex = i;
                        });
                        if (targetIndex > -1)
                            $(target).detach().insertAfter(childrenDivs[targetIndex + 1]);
                        else console.log("error moving down");
                    }
                }
                // location.replace("#" + $(target).attr("id"));//not neccessary
            }
        });
    });
}

function setupDeleteButtons() {
    $(".delete-buttons").remove();
    $(".delete-subbuttons").remove();
    $(".myWorks").each(function (i, obj) {
        $(obj).append(`<svg class="delete-buttons floaty-spans hidden-by-default" target="${$(this).attr("id")}"><line x1="75%" y1="25%" x2="25%" y2="75%" style="stroke:rgb(199,0,0);stroke-width:3" /><line x1="75%" y1="75%" x2="25%" y2="25%" style="stroke:rgb(199,0,0);stroke-width:3" /></svg>`);
    });
    $(".mySlides").each(function (i, obj) {
        $(obj).append(`<svg class="delete-buttons floaty-spans hidden-by-default" target="${$(this).attr("id")}"><line x1="75%" y1="25%" x2="25%" y2="75%" style="stroke:rgb(199,0,0);stroke-width:3" /><line x1="75%" y1="75%" x2="25%" y2="25%" style="stroke:rgb(199,0,0);stroke-width:3" /></svg>`);
    });
    $(".myExhibitions").each(function (i, obj) {
        $(obj).append(`<svg class="delete-buttons floaty-spans hidden-by-default" target="${$(this).attr("id")}"><line x1="75%" y1="25%" x2="25%" y2="75%" style="stroke:rgb(199,0,0);stroke-width:3" /><line x1="75%" y1="75%" x2="25%" y2="25%" style="stroke:rgb(199,0,0);stroke-width:3" /></svg>`);
    });
    $(".subobject").each(function (i, obj) {
        $(obj).append(`<svg class="delete-subbuttons floaty-spans hidden-by-default" target="${$(this).attr("id")}" dependency="${$(this).attr("dependency")}"><line x1="80%" y1="20%" x2="20%" y2="80%" style="stroke:rgb(199,0,0);stroke-width:3" /><line x1="80%" y1="80%" x2="20%" y2="20%" style="stroke:rgb(199,0,0);stroke-width:3" /></svg>`);
    });
    $(".subsubobject").each(function (i, obj) {
        $(obj).append(`<svg class="delete-subsubbuttons floaty-spans hidden-by-default" target="${$(this).attr("id")}" dependency="${$(this).parent().attr("id").split("-")[0]}"><line x1="80%" y1="20%" x2="20%" y2="80%" style="stroke:rgb(199,0,0);stroke-width:2" /><line x1="80%" y1="80%" x2="20%" y2="20%" style="stroke:rgb(199,0,0);stroke-width:2" /></svg>`);
    });
    $(".delete-buttons").on("click", (event) => {
        data = { "id": $(event.target).attr("target") }
        $.ajax({
            type: "POST",
            url: "delete-content",
            data: data
        }).done(function (res) {
            if (res.err) {
                alert(res.err);
                console.log(res.err);
            } else if (res.status === 200) {
                $("#" + $(event.target).attr("target")).remove();
                $("#" + $(event.target).attr("target") + "-modal").remove();
                if (options.url === "index") {
                    $("#navdot-div").children()[$("#navdot-div").children().length - 1].remove();
                    if ($(".mySlides").length > 0)
                        plusSlides(0);
                    else
                        $(".prev, .next").remove();
                }
                if (options.url === "works") {
                    resetContent();
                }
            }
        });
    });
    $(".delete-subbuttons").on("click", (event) => {
        data = {
            "id": $(event.target).attr("target")
            // ,"dependency": $(event.target).attr("dependency")
        }
        $.ajax({
            type: "POST",
            url: "delete-subcontent",
            data: data
        }).done(function (res) {
            if (res.err) {
                alert(res.err);
                console.log(res.err);
            } else if (res.status === 200) {
                $("#" + $(event.target).attr("target")).remove();
            }
        });
    });
    $(".delete-subsubbuttons").on("click", (event) => {
        data = {
            "id": $(event.target).attr("target")
            // ,"dependency": $(event.target).attr("dependency")
        }
        $.ajax({
            type: "POST",
            url: "delete-subsubcontent",
            data: data
        }).done(function (res) {
            if (res.err) {
                alert(res.err);
                console.log(res.err);
            } else if (res.status === 200) {
                $("#" + $(event.target).attr("target")).remove();
            }
        });
    });
}

function resizeIframe(obj) {
    if ($(obj).closest(".trailer").css("display") === "none") {
        $(obj).closest(".trailer").css("display", "block");
        $(obj).height($(obj).contents().find("html").height());
        $(obj).closest(".trailer").css("display", "none");
    } else {
        $(obj).height($(obj).contents().find("html").height());
    }
}
function resizeIframeJump(obj, url) {
    if ($(obj).closest(".trailer").css("display") === "none") {
        $(obj).closest(".trailer").css("display", "block");
        $(obj).height($(obj).contents().find("html").height());
        $(obj).closest(".trailer").css("display", "none");
    } else {
        $(obj).height($(obj).contents().find("html").height());
    }
    location.replace(url);
}
function placeContent(data, options) {
    if (data.descriptions) {
        data.descriptions.forEach(object => {
            if (object.text)
                object.text = object.text.replace(/ /g, "&nbsp;").replace(/(?:\r\n|\r|\n)/g, "<br>");
            let name = object._id + "." + object.format;
            if (imgFormats.includes(object.format)) {
                if ($(options.maindiv).children().first().hasClass(options.mainclass)) {
                    $(options.maindiv).prepend(`<div class="${options.mainclass + options.otherclass}" id="${object._id}"><img class="downloadable" src="../content/${name}">
                    <div class="poem-overlay"><div class="poem-container"><p class="line-1 anim-typewriter poem">${object.text}</p><div></div>
                                                <div class="text">${object.title}</div></div>`);
                } else
                    $(options.maindiv).children().eq(1).after(`<div class="${options.mainclass + options.otherclass}" id="${object._id}"><img class="downloadable" src="../content/${name}">
                    <div class="text">${object.title}</div></div>`);
                if (!object.isVisible) $("#" + object._id).append(`<div class="disabled-overlay">HIDDEN CONTINENT</div>`);
                if (["works", "exhibitions"].includes(options.url)) $("body").prepend(`<div class="modal" id="${object._id}-modal"><div id="${object._id}-content" class="modal-content has-subbutton"><svg class="floaty-span close"  viewbox="0 0 100 100">
                <path d="M 20 20 L 80 80 M 20 80 L 80 20" stroke="#646464" stroke-width="5" fill="none" />
            </svg><div class="image"><img src="../content/${name}"></div></div></div>`);
                if (options.url === "index") {
                    $("#undercontent").prepend(`<div class="trailer" id="${object._id}-modal"><div id="${object._id}-content" class="trailer-content has-subbutton"><div class="image"></div></div></div>`);
                    $("#navdot-div").append(`<span class="dot" onclick="currentSlide(${$(".dot").length + 1})"></span>`);
                }
                if (data.subdescriptions)
                    data.subdescriptions.forEach(subobject => {
                        if (subobject.dependency === object._id) {
                            let subname = subobject._id + "." + subobject.format;
                            if (imgFormats.includes(subobject.format))
                                $("#" + object._id + "-content").append(`<div class="subobject" id="${subobject._id}"><img class="downloadable" src="../subcontent/${subname}"></div>`);
                            if (audioFormats.includes(subobject.format))
                                $("#" + object._id + "-content").append(`<div class="subobject" id="${subobject._id}"><audio controls><source src="../subcontent/${subname}" type="audio/mpeg">Your browser does not support the audio element.</audio></div>`);
                            if (videoFormats.includes(subobject.format))
                                $("#" + object._id + "-content").append(`<div class="subobject" id="${subobject._id}"><video controls height="300"><source src="../subcontent/${subname}" type="video/mp4">Your browser does not support the video element.</video></div>`);
                            if (textFormats.includes(subobject.format))
                                $("#" + object._id + "-content").append(`<div class="subobject" id="${subobject._id}"><p><iframe src="../subcontent/${subname}" scrolling="no" onload="resizeIframe(this)"></iframe></p></div>`);
                            if (containerFormats.includes(subobject.format)) {
                                $("#" + object._id + "-content").append(`<div class="subobject has-subsubbutton" id="${subobject._id}"><div id="${subobject._id}-content" class="container-object"></div></div>`);
                                data.subsubdescriptions.forEach(subsubobject => {
                                    if (subsubobject.dependency === subobject._id && imgFormats.includes(subsubobject.format))
                                        $("#" + subobject._id + "-content").append(`<div class="subsubobject" id="${subsubobject._id}"><img class="downloadable" src="../subsubcontent/${subsubobject._id + "." + subsubobject.format}"></div>`);
                                });
                            }
                        }
                    });
            }
        });
        setupSetups(options);
        $(".anim-typewriter").each(function (i, obj) {
            $(this).css("animation-duration", `${Math.round($(this).text().length * 100)}ms, 500ms`);
            console.log($(this).css("animation-duration"));
        });
    }
}
function placeSubcontent(subobject) {
    let object = subobject.parent;
    if (imgFormats.includes(subobject.format))
        $("#" + object._id + "-content").append(`<div class="subobject" id="${subobject._id}"><img class="downloadable" src="../subcontent/${subobject._id + "." + subobject.format}" onload=location.replace("#${subobject._id}")></div>`);
    if (audioFormats.includes(subobject.format))
        $("#" + object._id + "-content").append(`<div class="subobject" id="${subobject._id}"><audio controls><source src="../subcontent/${subobject._id + "." + subobject.format}" type="audio/mpeg" onload=location.replace("#${subobject._id}")>Your browser does not support the audio element.</audio></div>`);
    if (videoFormats.includes(subobject.format))
        $("#" + object._id + "-content").append(`<div class="subobject" id="${subobject._id}"><video controls height="300"><source src="../subcontent/${subobject._id + "." + subobject.format}" type="video/mp4" onload=location.replace("#${subobject._id}")>Your browser does not support the video element.</video></div>`);
    if (textFormats.includes(subobject.format))
        $("#" + object._id + "-content").append(`<div class="subobject" id="${subobject._id}"><p><iframe src="../subcontent/${subobject._id + "." + subobject.format}" scrolling="no" onload='resizeIframeJump(this, "#${subobject._id}")'></iframe></p></div>`);
    if (containerFormats.includes(subobject.format)) {
        $("#" + object._id + "-content").append(`<div class="subobject has-subsubbutton" id="${subobject._id}"><div id="${subobject._id}-content" class="container-object" onload=location.replace("#${subobject._id}")></div></div>`);
    }
}
function setupSetups(options) {
    if (isLoggedIn) {//add admin control buttons
        setupDeleteButtons();
        setupSwapPositionButtons();
        setupAddSubcontentButtons();
        setupToggleVisibilityButtons(options.mainclass);
        if (options.url === "index") setupChangeStatusButtons("past");
        if (options.url === "works") setupChangeStatusButtons("ongoing");
    }
    addFunctionality();// add functions to X buttons, addfile buttons...
    // setupDownloadButtons();
    if (options.url === "index") {
        $(".placeholder").remove();
        if ($(".mySlides").length > 0) { showSlides(1); }
        else { $(".prev, .next").remove(); }
    }
    $("div").attr("onclick", ""); // THIS IS THE WORKAROUND FOR IPHONES!!!!1!!1!!1!!1!!!!1!1!
}
function isFromYear(timestamp, year) {
    return (Math.trunc(timestamp / 31556952000 + 1970) == year);
}

$('#topnavibar').load('/html/topnavi.html');

let imgFormats = ["jpg", "jpeg", "png", "gif", "bmp"];
let audioFormats = ["wav", "mp3"];
let videoFormats = ["mp4"];
let textFormats = ["txt", "html"];
let containerFormats = ["container"];