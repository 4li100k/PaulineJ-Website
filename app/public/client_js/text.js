const mq = window.matchMedia("(min-width: 600px)");
var fonts = [false, 'sofia', 'roboto', "comic-sans-ms"];
var Font = Quill.import('formats/font');
Font.whitelist = fonts;
Quill.register(Font, true);
const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],       // doesn't work
    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered' }/* , { 'list': 'bullet' } */],        // list, unordered list doesn't work because there is global css override
    [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'align': [] }],
    ['link'],          // add's image support
    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    // [{ 'direction': 'rtl' }],                         // text direction
    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],          // basic headers
    [{ 'color': [] }, { 'background': [] }],          // background highlight
    [{ 'font': fonts }],                            //select font
    ['clean']                                         // removes formatting
];

$(document).ready(async function () {
    isLoggedIn = false;
    await $.get("isLoggedIn", function (data) {
        isLoggedIn = data.body;
    });
    if (isLoggedIn) {
        $("#text_side_navi").append(`<svg id="add-file-button" class="floaty-spans upload-buttons" viewbox="0 0 100 100">
        <path d="M 20 60 L 20 70 q 0 10 10 10 L 70 80 q 10 0 10 -10 L 80 60 M 60 65 L 40 65 L 40 45 L 30 45 L 50 20  L 70 45 L 60 45 L 60 65 L 40 65" stroke="#000000" stroke-width="5" fill="none" />
    </svg>`);
        $("#add-file-button").on("click", () => {
            $("#myModal").css("display", "block");
        });
        $("#mainsitenav").append(`<form action="/logout" method="get">
        <input type="submit" value="LOGOUT" />
    </form>`);
        $("#topnavibar").append(`<svg class="newsletter-buttons floaty-spans" viewbox="0 0 100 100"><path d="M 25 30 L 75 30 q 5 0 5 5 L 80 65 q 0 5 -5 5 L 25 70 q -5 0 -5 -5 L 20 35 q 0 -5 5 -5 M 23 33 L 50 50 L 77 33" stroke="#c7c700" stroke-width="5" fill="none" /></svg>`);
    }

    $.get("get-poems", function (data) {
        if (data.err) {
            console.log(data.err);
        }
        console.log(data);
        if (data.descriptions) {
            data.descriptions.forEach((object) => {
                $("#text_side_navi").append(`<div id="${object._id}" class="text_title"><a>${object.title}</a></div>`);
                $(".small-media-text").append(`<button class="accordion">${object.title}</button>
                <div class="panel"><pre>${object.htmlString}</pre></div>`);
                console.log("panel text: " + object.htmlString);
                load_text_content("#" + object._id, "/content/" + object._id + "." + object.format);
            });
        } else {
            //resize so it doesn't look empty
        }
        setupTextSetups();
        $("#text_side_navi").find("a").first().click();
        responsiveText();
    });

    $("#fileupload").submit(function (e) {
        e.preventDefault();
        var formData = new FormData(this);
        let data = {}
        formData.forEach(function (value, key) {
            data[key] = value;
        });
        console.log(data);
        $.ajax({
            url: $(this).attr("action"),
            type: 'POST',
            data: data
        }).done((data) => {
            console.log(data);
            if (data.err) { return alert(data.err); };
            $("#fileupload").trigger("reset");
            $("#custom-file-upload-title").html("");
            let object = data.object;
            $("#text_side_navi").append(`<div id="${object._id}" class="text_title"><a>${object.title}</a></div>`);
            load_text_content("#" + object._id, "/content/" + object._id + "." + object.format);
            $(".modal").css("display", "none");
            $("#text_side_navi").find("#" + object._id).find("a").click();
            setupTextSetups();
        });
    });
});

function load_text_content(id, srcfile) {
    $(id).find("a").click(async function () {
        $("#text_content").empty();
        // $("#text_content").addClass("ql-editor");
        let html = await getRawHtml(id);
        $("#text_content").append(`<div class="ql-editor">` + html + `</div>`);
    });
}

function load_text_edit(id, htmlContent) {
    $("#text_content").empty();
    // $("#text_content").removeClass("ql-editor");    
    $("#text_content").append(`<div id="editorr"></div>`);
    var quill = new Quill('#editorr', {
        theme: 'snow',
        modules: {
            toolbar: toolbarOptions
        }
    });
    // quill.setText(htmlContent);
    $("#editorr").find(".ql-editor").append(htmlContent);
    $("#editorr").find("p").first().remove();
    $("#editorr").find("select.ql-font").append(`<option selected="">Fredericka the Great</option>`);
    $("#text_content").append(`<svg class="save-text-buttons floaty-spans" target="${id}" viewbox="0 0 100 100"><path d="M 80 20 L 40 80 L 20 50" stroke="#00c700" stroke-width="10" fill="none" /></svg>`);
    $(".save-text-buttons").on("click", (event) => {
        data = {
            "id": $(event.target).attr("target"),
            "html": $("#editorr").find(".ql-editor").html(),
            "htmlString": quill.getText(0, quill.getLength()).replace(/\n/g, '\q').replace(/\s\s+/g, ' ').replace(/\q/g, '\n')
        }
        $.ajax({
            type: "POST",
            url: "save-html-content",
            data: data
        }).done(function (res) {
            if (res.err) {
                alert(res.err);
                console.log(res.err);
            } else if (res.status === 200) {
                $("#" + id).find("a").click();
            }
        });
    });
}

function getSizeOfTextandReframe(obj) {
    let content_height = $(obj).contents().find("html").height();
    if (content_height > 610) {
        $(obj).height(content_height + "px");
        $(".writting_display").height(content_height + 40 + "px");
        $("#text_content").height(content_height + 20 + "px");
        $("#text_side_navi").height(content_height + "px");
    }
    else if (mq.matches) {
        $(obj).height(610);
        $(".writting_display").height(610 + 40);
        $("#text_content").height(610 + 20);
        $("#text_side_navi").height(610);
    }
    $(obj).contents().find("head").append(`<base target="_parent">`);
}

function setupTextSetups() {
    addFunctionality();
    if (isLoggedIn) {
        $(".delete-text-buttons").remove();
        $(".text_title").each(function (i, obj) {
            $(obj).append(`<svg class="delete-text-buttons floaty-spans hidden-by-default" target="${$(this).attr("id")}"><line x1="75%" y1="25%" x2="25%" y2="75%" style="stroke:rgb(199,0,0);stroke-width:3" /><line x1="75%" y1="75%" x2="25%" y2="25%" style="stroke:rgb(199,0,0);stroke-width:3" /></svg>`);
        });
        $(".text_title").each(function (i, obj) {
            $(obj).append(`<svg class="edit-text-buttons floaty-spans hidden-by-default" target="${$(this).attr("id")}" viewbox="0 0 100 100">
            <path d="M 30 80 q -5 0 -5 -5 L 25 40 q 0 -5 5 -5 L 65 35 q 5 0 5 5 L 70 75 q 0 5 -5 5 L 30 80" stroke="#000000" stroke-width="5" fill="none" />
        <path d="M 50 60 L 90 20" stroke="rgb(206, 232, 233)" stroke-width="30" fill="none" />
        <path d="M 42 68 L 55 65 L 80 40 L 70 30 L 45 55 L 42 68 L 55 65 M 73 47 L 63 37" stroke="#000000" stroke-width="5" fill="none" />
            </svg>`);
        });
        $(".delete-text-buttons").on("click", (event) => {
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
                    $("#text_content").contents().remove();
                }
            });
        });
        $(".edit-text-buttons").on("click", (event) => {
            data = { "id": $(event.target).attr("target") }
            $.ajax({
                type: "POST",
                url: "get-html-content",
                data: data
            }).done(function (res) {
                if (res.err) {
                    alert(res.err);
                    console.log(res.err);
                } else if (res.status === 200) {
                    load_text_edit($(event.target).attr("target"), res.html);
                }
            });
        });
        $(".swap-text-subbuttons").remove();
        $(".text_title").each(function (i, obj) {
            $(obj).append(`<svg class="swap-text-subbuttons floaty-spans hidden-by-default" target="${$(this).attr("id")}" direction="up"><line x1="20%" y1="80%" x2="50%" y2="20%" style="stroke:#ffffff;stroke-width:3" /><line x1="50%" y1="20%" x2="80%" y2="80%" style="stroke:#ffffff;stroke-width:3" /></svg>`);
            $(obj).append(`<svg class="swap-text-subbuttons floaty-spans hidden-by-default" target="${$(this).attr("id")}" direction="down"><line x1="20%" y1="20%" x2="50%" y2="80%" style="stroke:#ffffff;stroke-width:3" /><line x1="50%" y1="80%" x2="80%" y2="20%" style="stroke:#ffffff;stroke-width:3" /></svg>`);
        });
        $(".swap-text-subbuttons").on("click", (event) => {
            data = {
                "id": $(event.target).attr("target"),
                "direction": $(event.target).attr("direction"),
                "collection": "content",
                "filter": "type"
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
                    let childrenDivs = $(parentDiv).children(".text_title");
                    console.log(target);
                    console.log($(target));

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
    }
    //setup swap buttons
}


function getRawHtml(id) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "POST",
            url: "get-html-content",
            data: { "id": id.substring(1) }
        }).done(function (res) {
            if (res.err) {
                resolve(undefined);
            } else if (res.status === 200) {
                resolve(res.html);
            }
        });
    });
}

function responsiveText() {
    if (mq.matches) {
        console.log("mq.matches");
    } else {
        var acc = document.getElementsByClassName("accordion");
        var i;
        console.log("acc length: " + acc.length);

        for (i = 0; i < acc.length; i++) {
            acc[i].addEventListener("click", function () {
                this.classList.toggle("active");
                var panel = this.nextElementSibling;
                console.log(panel);
                if (panel.style.display === "block") {
                    panel.style.display = "none";
                } else {
                    panel.style.display = "block";
                }
            });
        }
    }
}