const express = require("express");
const app = express();

app.use(express.static(__dirname + "/public"));//makes static files accessible

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));// parse application/x-www-form-urlencoded
app.use(bodyParser.json());// parse application/json
const formidable = require("formidable");
const fs = require("fs");

const mongo = require("mongodb").MongoClient;
let ObjectId = require("mongodb").ObjectID; // for creating mongoose id objects out of id strings
const bcrypt = require("bcrypt");
const saltRounds = 10;


const extract = require('extract-zip');
const juice = require('juice');

const session = require('express-session');
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));
const nodemailer = require("nodemailer");
let db;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const authFile = function (req, res, next) { // if you are logged in, proceed, otherwise display html error
    if (req.session && req.session.admin)
        return next();
    else
        return res.sendFile(__dirname + "/public/html/unauthorized.html");
};
const auth = function (req, res, next) { // if you are logged in, proceed, otherwise send json error
    if (req.session && req.session.admin)
        return next();
    else
        return res.json({ "err": "unauthorized" });
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//!!! temporary methods !!!

app.post("/registerUser", auth, function (req, res) { // creates an admin account, no form, use postman for this
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    console.log(saltRounds, username, password, email);

    bcrypt.hash(password, saltRounds).then(function (hash) {
        let newUser = {
            "username": username,
            "password": hash,
            "email": email
        }
        db.collection("users").insert(newUser, function (err, success) {
            console.log(success);
            res.send("success");
        });
    }).catch(function (err) {
        console.log(err);
        res.send("failure");
    });
});
//!!! temporary methods !!!
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//navigation
app.get("/unauthorized", function (req, res) {
    res.sendFile(__dirname + "/public/html/unauthorized.html");
});
app.get("/login", function (req, res) {
    res.sendFile(__dirname + "/public/html/login.html");
});
app.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("back");//reloads the page
});
app.get("/works", function (req, res) {
    res.sendFile(__dirname + "/public/html/works.html");
});
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/html/index.html");
});
app.get("/pauline_jupin", function (req, res) {
    res.sendFile(__dirname + "/public/html/pauline_jupin.html");
});
app.get("/exhibitions", function (req, res) {
    res.sendFile(__dirname + "/public/html/exhibitions.html");
});
app.get("/text", function (req, res) {
    res.sendFile(__dirname + "/public/html/text.html");
});
app.get("/newsletter_broadcast", function (req, res) {
    res.sendFile(__dirname + "/public/html/newsletter_temp.html");
});
app.get("/newsletter_broadcast", function (req, res) {
    res.sendFile(__dirname + "/public/html/news_generator.html");
});
app.post("/subscribe-test", function (req, res) {
    let data = req.body;
    res.status(200);
    res.json(data);
    console.log("user email: " + data);
});

//navigation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//model manipulation (admin only)

app.post("/fileupload", auth, function (req, res) { // upload a file from the form and then refresh the page
    let response = {};
    let allowedFileFormats = ["jpg", "jpeg", "png", "gif", "bmp", "html"];
    let form = new formidable.IncomingForm();
    form.maxFileSize = 10 * 1024 * 1024;
    form.parse(req, async function (err, fields, files) {
        if (files.filetoupload.size == 0) { response.err = "you need to include a file"; return res.json(response); }
        files.filetoupload.name = files.filetoupload.name.toLowerCase();
        if (!allowedFileFormats.includes(files.filetoupload.name.split(".").pop())) return response.err = "wrong file format", res.json(response), fs.unlinkSync(files.filetoupload.path);
        if (["work", "exhibition", "poem"].includes(fields.type)) {
            //create json object and insert into database
            let object = {};
            let yearDifference = new Date().getFullYear() - fields.yearpicker;
            object.timestamp = new Date().getTime() - yearDifference * 31556952000;
            object.title = fields.title;
            object.text = fields.text;
            object.type = fields.type;
            object.status = fields.status || "default";
            object.isVisible = false;
            if (object.type === "poem")
                object.isVisible = true;
            object.format = files.filetoupload.name.split(".").pop(); // saves the file extension

            if (object.type === "poem" && object.format !== "html") { response.err = "a poem has to be in HTML format"; return res.json(response) }
            if (object.type !== "poem" && object.format === "html") { response.err = "the content can only be a picture"; return res.json(response) }
            await db.collection("content").insert(object);
            response.object = object;// must be here because .insert() gives it the _id attribute
            let oldpath = files.filetoupload.path;
            let newpath = __dirname + "/public/content/" + object._id + "." + object.format;
            if (!fs.existsSync(__dirname + "/public/content")) fs.mkdirSync(__dirname + "/public/content");
            fs.renameSync(oldpath, newpath); // moves the file from a temporary folder to our content folder
        }
        res.json(response);
    });
});
app.post("/poem-upload", auth, async function (req, res) { // upload a file from the form and then refresh the page
    let response = {};
    console.log(req.body);
    let object = {};
    let yearDifference = new Date().getFullYear() - req.body.yearpicker;
    object.timestamp = new Date().getTime() - yearDifference * 31556952000;
    object.title = req.body.title;
    object.type = "poem";
    object.status = "default";
    object.isVisible = true;
    object.format = "html"; // saves the file extension
    object.htmlString = "";
    await db.collection("content").insert(object);
    response.object = object;// must be here because .insert() gives it the _id attribute
    if (!fs.existsSync(__dirname + "/public/content")) fs.mkdirSync(__dirname + "/public/content");
    fs.writeFileSync(__dirname + "/public/content/" + object._id + ".html", "", "utf8");
    response.status = 200;
    res.json(response);
});
app.post("/subfileupload", auth, function (req, res) { // upload a subfile from the form and then refresh the page
    let response = {};
    let allowedFileFormats = ["jpg", "jpeg", "png", "gif", "bmp",
        "wav", "mp3",
        "mp4",
        "txt", "html"];
    let form = new formidable.IncomingForm();
    form.maxFileSize = 10 * 1024 * 1024;
    form.parse(req, async function (err, fields, files) {
        if (files.filetoupload.size == 0) { fs.unlinkSync(files.filetoupload.path); response.err = "you need to include a file"; return res.json(response); }
        files.filetoupload.name = files.filetoupload.name.toLowerCase();
        if (!allowedFileFormats.includes(files.filetoupload.name.split(".").pop())) { fs.unlinkSync(files.filetoupload.path); response.err = "wrong file format"; return res.json(response); }
        let object = {};
        object.timestamp = new Date().getTime();
        let parentObject = await db.collection("content").findOne({ "_id": new ObjectId(fields.dependency) });
        if (!parentObject) { response.err = "invalid dependency"; return res.json(response); };
        object.dependency = fields.dependency;
        object.format = files.filetoupload.name.split(".").pop();
        await db.collection("subcontent").insert(object);
        response.object = object;// must be here because .insert() gives it the _id attribute
        response.object.parent = parentObject;
        let oldpath = files.filetoupload.path;
        let newpath = __dirname + "/public/subcontent/" + object._id + "." + object.format;
        if (!fs.existsSync(__dirname + "/public/subcontent")) fs.mkdirSync(__dirname + "/public/subcontent");
        fs.renameSync(oldpath, newpath); // moves the file from a temporary folder to our subcontent folder
        res.json(response);
    });

});
app.post("/subsubfileupload", auth, function (req, res) { // upload a subsubfile from the form and then refresh the page
    let response = {};
    let allowedFileFormats = ["jpg", "jpeg", "png", "gif", "bmp"];
    let form = new formidable.IncomingForm();
    form.maxFileSize = 10 * 1024 * 1024;
    form.parse(req, async function (err, fields, files) {
        if (files.filetoupload.size == 0) { fs.unlinkSync(files.filetoupload.path); response.err = "you need to include a file"; return res.json(response); }
        files.filetoupload.name = files.filetoupload.name.toLowerCase();
        if (!allowedFileFormats.includes(files.filetoupload.name.split(".").pop())) { fs.unlinkSync(files.filetoupload.path); response.err = "wrong file format"; return res.json(response); }
        let object = {};
        object.timestamp = new Date().getTime();
        let parentObject = await db.collection("subcontent").findOne({ "_id": new ObjectId(fields.dependency) });
        if (!parentObject) { response.err = "invalid dependency"; return res.json(response); };
        object.dependency = fields.dependency;
        object.format = files.filetoupload.name.split(".").pop();
        await db.collection("subsubcontent").insert(object);
        response.object = object;// must be here because .insert() gives it the _id attribute
        response.object.parent = parentObject;
        let oldpath = files.filetoupload.path;
        let newpath = __dirname + "/public/subsubcontent/" + object._id + "." + object.format;
        if (!fs.existsSync(__dirname + "/public/subsubcontent")) fs.mkdirSync(__dirname + "/public/subsubcontent");
        fs.renameSync(oldpath, newpath); // moves the file from a temporary folder to our subcontent folder
        res.json(response);
    });
});
app.post("/containerupload", auth, async function (req, res) { // upload a subfile from the form and then refresh the page
    let response = {};
    let object = {};
    object.timestamp = new Date().getTime();
    let parentObject = await db.collection("content").findOne({ "_id": new ObjectId(req.body.dependency) });
    if (!parentObject) { response.err = "invalid dependency"; return res.json(response); };
    object.dependency = req.body.dependency;
    object.format = "container";
    response.success = await db.collection("subcontent").insert(object);
    response.object = object;// must be here because .insert() gives it the _id attribute
    response.object.parent = parentObject;
    response.status = 200;
    res.json(response);
});
app.post("/biographyupload", auth, function (req, res) { // upload a file from the form and then refresh the page
    let response = {};
    let allowedFileFormats = ["html"];
    let form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        if (files.filetoupload.size == 0) { fs.unlinkSync(files.filetoupload.path); response.err = "you need to include a file"; return res.json(response); }
        files.filetoupload.name = files.filetoupload.name.toLowerCase();
        if (!allowedFileFormats.includes(files.filetoupload.name.split(".").pop())) { fs.unlinkSync(files.filetoupload.path); response.err = "wrong file format"; return res.json(response); }
        let oldpath = files.filetoupload.path;
        let newpath = __dirname + "/public/html/biography.html";
        fs.renameSync(oldpath, newpath); // moves the file from a temporary folder to our content folder
        res.redirect("back");//reloads the page
    });
});
app.post("/contactupload", auth, function (req, res) { // upload a file from the form and then refresh the page
    let response = {};
    let allowedFileFormats = ["html"];
    let form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        if (files.filetoupload.size == 0) { fs.unlinkSync(files.filetoupload.path); response.err = "you need to include a file"; return res.json(response); }
        files.filetoupload.name = files.filetoupload.name.toLowerCase();
        if (!allowedFileFormats.includes(files.filetoupload.name.split(".").pop())) { fs.unlinkSync(files.filetoupload.path); response.err = "wrong file format"; return res.json(response); }
        let oldpath = files.filetoupload.path;
        let newpath = __dirname + "/public/html/contact.html";
        fs.renameSync(oldpath, newpath); // moves the file from a temporary folder to our content folder
        res.redirect("back");//reloads the page
    });
});
app.post("/pictureupload", auth, function (req, res) { // upload a file from the form and then refresh the page
    let response = {};
    let allowedFileFormats = ["jpg", "jpeg", "png", "gif", "bmp"];
    let form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        if (files.filetoupload.size == 0) { fs.unlinkSync(files.filetoupload.path); response.err = "you need to include a file"; return res.json(response); }
        files.filetoupload.name = files.filetoupload.name.toLowerCase();
        if (!allowedFileFormats.includes(files.filetoupload.name.split(".").pop())) { fs.unlinkSync(files.filetoupload.path); response.err = "wrong file format"; return res.json(response); }
        fs.renameSync(files.filetoupload.path, __dirname + "/public/pictures/biography.jpg"); // moves the file from a temporary folder to our content folder
        res.redirect("back");//reloads the page
    });
});
app.post("/changeStatus", auth, async function (req, res) {// from ongoing to past or back
    let response = {};
    if (req.body.status === "ongoing" || req.body.status === "past") {
        let newValues = { $set: { "status": req.body.status } }; // the $set is there to only change the fields provided, leaving rest untouched
        await db.collection("content").updateOne({ "_id": new ObjectId(req.body.id) }, newValues);
        response.status = 200;
    }
    res.json(response);
});

app.post("/toggleVisibility", auth, async function (req, res) {// for regular users
    let response = {};
    let content = await db.collection("content").findOne({ "_id": new ObjectId(req.body.id) });
    let newValues = { $set: { "isVisible": !content.isVisible || false } }; // the $set is there to only change the fields provided, leaving rest untouched
    await db.collection("content").updateOne({ "_id": new ObjectId(content._id) }, newValues);
    response.object = await db.collection("content").findOne({ "_id": new ObjectId(req.body.id) });
    response.status = 200;
    res.json(response);
});

app.post("/swap", auth, async function (req, res) {
    let response = {};
    if (["up", "down"].includes(req.body.direction)) { // if the choice is valid
        let collection = req.body.collection;
        let filter = req.body.filter;
        let targetSubcontent = await db.collection(collection).findOne({ "_id": new ObjectId(req.body.id) }); // get our target subcontent
        if (!targetSubcontent) { response.err = "target not found"; return res.json(response); };
        if (filter === "dependency") filter = { "dependency": targetSubcontent.dependency };
        else if (filter === "type") filter = { "type": targetSubcontent.type };
        else { response.err = "invalid filter"; return res.json(response); }
        let subcontents = await db.collection(collection).find(filter).toArray(); // get all subcontents
        subcontents.sort(function (a, b) { // sort them by the timestamp
            return a.timestamp < b.timestamp ? 1 : (a.timestamp > b.timestamp ? -1 : 0);
        });
        let targetIndex = -1;
        subcontents.findIndex(function (item, i) {
            if (ObjectId(item._id).toString() === ObjectId(targetSubcontent._id).toString()) {
                targetIndex = i;
                //return i doesn't work because "return 0;" returns -1 for some reason
            }
        });
        if (targetIndex > -1) {//if found
            if (req.body.direction === "up" && targetIndex != subcontents.length - 1) { // if we are moving up and there is something above
                let newTimestamp = subcontents[targetIndex + 1].timestamp;
                let oldTimestamp = subcontents[targetIndex].timestamp;
                let newValues = { $set: { "timestamp": newTimestamp } };
                await db.collection(collection).updateOne({ "_id": new ObjectId(subcontents[targetIndex]._id) }, newValues);
                newValues = { $set: { "timestamp": oldTimestamp } };
                await db.collection(collection).updateOne({ "_id": new ObjectId(subcontents[targetIndex + 1]._id) }, newValues);
                response.status = 200;
            } else if (req.body.direction === "down" && targetIndex != 0) { // if we are moving down and there is something below
                let newTimestamp = subcontents[targetIndex - 1].timestamp;
                let oldTimestamp = subcontents[targetIndex].timestamp;
                let newValues = { $set: { "timestamp": newTimestamp } };
                await db.collection(collection).updateOne({ "_id": new ObjectId(subcontents[targetIndex]._id) }, newValues);
                newValues = { $set: { "timestamp": oldTimestamp } };
                await db.collection(collection).updateOne({ "_id": new ObjectId(subcontents[targetIndex - 1]._id) }, newValues);
                response.status = 200;
            } else if (req.body.direction === "up" && targetIndex == subcontents.length - 1) {// if the first element wants to go even firster (to the bottom)
                let newTimestamp = subcontents[0].timestamp + 1;
                let newValues = { $set: { "timestamp": newTimestamp } };
                await db.collection(collection).updateOne({ "_id": new ObjectId(subcontents[targetIndex]._id) }, newValues);
                response.status = 200;
            } else if (req.body.direction === "down" && targetIndex == 0) {// if the last element wants to go even laster (to the top)
                let newTimestamp = subcontents[subcontents.length - 1].timestamp - 1;
                let newValues = { $set: { "timestamp": newTimestamp } };
                await db.collection(collection).updateOne({ "_id": new ObjectId(subcontents[targetIndex]._id) }, newValues);
                response.status = 200;
            }
        }
    }
    res.json(response);
});

app.post("/delete-content", auth, async function (req, res) { // delete the ongoing content and all subcontents associated
    let response = {};

    let content = await db.collection("content").findOne({ "_id": new ObjectId(req.body.id) });
    let subcontents = await db.collection("subcontent").find({ "dependency": ObjectId(content._id).toString() }).toArray();
    subcontents.forEach(async (subcontent) => {
        let subsubcontents = await db.collection("subsubcontent").find({ "dependency": ObjectId(subcontent._id).toString() }).toArray();
        subsubcontents.forEach((subsubcontent) => {
            if (fs.existsSync(__dirname + "/public/subsubcontent/" + subsubcontent._id + "." + subsubcontent.format))
                fs.unlinkSync(__dirname + "/public/subsubcontent/" + subsubcontent._id + "." + subsubcontent.format);
        });
        await db.collection("subsubcontent").deleteMany({ "dependency": ObjectId(subcontent._id).toString() });
        if (fs.existsSync(__dirname + "/public/subcontent/" + subcontent._id + "." + subcontent.format))
            fs.unlinkSync(__dirname + "/public/subcontent/" + subcontent._id + "." + subcontent.format);
    });
    await db.collection("subcontent").deleteMany({ "dependency": ObjectId(content._id).toString() });
    if (fs.existsSync(__dirname + "/public/content/" + content._id + "." + content.format))
        fs.unlinkSync(__dirname + "/public/content/" + content._id + "." + content.format);
    await db.collection("content").deleteOne({ "_id": new ObjectId(content._id) });

    response.status = 200;
    res.json(response);
});

app.post("/delete-subcontent", auth, async function (req, res) { // delete a subcontent, if the folder is empty, delete it too
    let response = {};
    if (Object.keys(req.body) == 0) { return response.err = "empty request body", res.json(response) }
    let object = await db.collection("subcontent").findOne({ "_id": new ObjectId(req.body.id) });
    let subsubcontents = await db.collection("subsubcontent").find({ "dependency": ObjectId(object._id).toString() }).toArray();
    subsubcontents.forEach((subsubcontent) => {
        if (fs.existsSync(__dirname + "/public/subsubcontent/" + subsubcontent._id + "." + subsubcontent.format))
            fs.unlinkSync(__dirname + "/public/subsubcontent/" + subsubcontent._id + "." + subsubcontent.format);
    });
    await db.collection("subsubcontent").deleteMany({ "dependency": ObjectId(object._id).toString() });
    if (fs.existsSync(__dirname + "/public/subcontent/" + object._id + "." + object.format))
        fs.unlinkSync(__dirname + "/public/subcontent/" + object._id + "." + object.format); //delete content
    await db.collection("subcontent").deleteOne({ "_id": new ObjectId(req.body.id) });
    response.status = 200;
    res.json(response);
});

app.post("/delete-subsubcontent", auth, async function (req, res) { // delete a subcontent, if the folder is empty, delete it too
    let response = {};
    let object = await db.collection("subsubcontent").findOne({ "_id": new ObjectId(req.body.id) });
    if (fs.existsSync(__dirname + "/public/subsubcontent/" + object._id + "." + object.format))
        fs.unlinkSync(__dirname + "/public/subsubcontent/" + object._id + "." + object.format); //delete content
    await db.collection("subsubcontent").deleteOne({ "_id": new ObjectId(req.body.id) });
    response.status = 200;
    res.json(response);
});
////end of admin only

app.post("/subscribe", function (req, res) { // adds a subscriber to the database and send an e-mail to them
    let response = {};
    let name = req.body.name;
    let email = req.body.email;

    db.collection("subscribers").find({ "email": email }).limit(1).toArray(function (err, foundSubscribers) {
        if (foundSubscribers.length) {
            response.err = "you are already subscribed";
            return res.json(response);
        }
        let newSubscriber = {
            "name": name,
            "email": email
        }
        db.collection("subscribers").insert(newSubscriber, function (err, success) {
            sendEmail(newSubscriber, "confirmation", name).then(() => {
                response.status = 200;
                res.json(response);
            }).catch((err) => {
                response.err = err;
                res.json(response);
            });
        });
    });
});
app.get("/unsubscribe", function (req, res) { // removes a subscriber from the database, a link to this appears in every e-mail sent by us
    let response = {};
    let id = req.query.id;
    response.id = id;

    db.collection("subscribers").deleteOne({ "_id": new ObjectId(id) }, function (err, foundSubscribers) {
        if (err) {
            response.err = err;
            return res.json(response);
        }
        if (foundSubscribers.result.n == 0) {
            response.err = "no subscriber match";
            return res.json(response);
        }
        response.status = 200;
        return res.json(response);
    });
});
//model manipulation
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.post("/loginUser", function (req, res) { // logs the user in (only admin can have an account)
    let response = {};
    let username = req.body.username;
    let password = req.body.password;
    db.collection("users").find({ "username": username }).limit(1).toArray(function (err, foundUsers) {
        if (foundUsers.length) {
            bcrypt.compare(password, foundUsers[0].password).then(function (found) {
                if (found) {
                    req.session.username = username;
                    req.session.admin = true;
                    response.status = 200;
                    res.json(response);
                }
                else {
                    response.err = "wrong username or password";
                    res.json(response);
                }
            });
        }
        else {
            response.err = "wrong username or password";
            res.json(response);
        }
    });
});

app.get("/get-ongoing", async function (req, res) { // upon loading the main page, get json object of all content and subcontent
    let response = await getSpecificContent(req, "work", "ongoing");
    return res.json(response);
});
app.get("/get-past", async function (req, res) { // upon loading the main page, get json object of all content and subcontent
    let response = await getSpecificContent(req, "work", "past");
    return res.json(response);
});
app.get("/get-exhibitions", async function (req, res) { // upon loading the main page, get json object of all content and subcontent
    let response = await getSpecificContent(req, "exhibition");
    return res.json(response);
});
app.get("/get-future-exhibitions", async function (req, res) { // upon loading the main page, get json object of all content and subcontent
    let response = await getSpecificContent(req, "exhibition", "future");
    return res.json(response);
});
app.get("/get-present-exhibitions", async function (req, res) { // upon loading the main page, get json object of all content and subcontent
    let response = await getSpecificContent(req, "exhibition", "present");
    return res.json(response);
});
app.get("/get-past-exhibitions", async function (req, res) { // upon loading the main page, get json object of all content and subcontent
    let response = await getSpecificContent(req, "exhibition", "past");
    return res.json(response);
});
app.get("/get-poems", async function (req, res) {
    let response = await getSpecificContent(req, "poem");
    return res.json(response);
});
app.post("/get-html-content", async function (req, res) {
    let response = {};
    let poem = await db.collection("content").findOne({ "_id": new ObjectId(req.body.id) });
    if (!poem) { response.err = "poem not found"; return res.json(response); }
    if (fs.existsSync(__dirname + "/public/content/" + poem._id + "." + poem.format, "utf8"))
        response.html = fs.readFileSync(__dirname + "/public/content/" + poem._id + "." + poem.format, "utf8");
    else { response.err = `file ${poem._id}.${poem.format} cannot be found`; return res.json(response); }
    response.status = 200;
    res.json(response);
});
app.post("/save-html-content", async function (req, res) {
    let response = {};
    let poem = await db.collection("content").findOne({ "_id": new ObjectId(req.body.id) });
    if (!poem) {
        response.err = "poem not found";
        return res.json(response);
    } else {
        let myQuery = { _id: new ObjectId(req.body.id) };
        let newValue = {
            $set: {
                "htmlString": req.body.htmlString
            }
        };
        db.collection("content").updateOne(myQuery, newValue, (err) => {
            if (err) throw err;
        });
        // poem.htmlString = req.body.htmlString;
    }
    response.html = fs.writeFileSync(__dirname + "/public/content/" + poem._id + "." + poem.format, req.body.html, "utf8");
    response.htmlString = req.body.htmlString;
    response.status = 200;
    res.json(response);
});
app.get("/get-works-years", async function (req, res) {//reads all the works and returns unrepeating years
    let response = {};
    let mongoFiles = [];
    response.years = [];
    if (req.session && req.session.admin) mongoFiles = await db.collection("content").find({ "status": "past" }).toArray();
    else mongoFiles = await db.collection("content").find({ "isVisible": true, "status": "past" }).toArray();
    mongoFiles.forEach((file) => {
        let year = Math.trunc(file.timestamp / 31556952000 + 1970);
        if (!response.years.includes(year))
            response.years.push(year);
    });
    response.years.sort(function (a, b) {
        return a < b ? 1 : (a > b ? -1 : 0); //if A < B then return 1, else if A > B return -1, zero is unreachable
    });
    res.status = 200;
    res.json(response);
});
app.get("/get-works-by-year", async function (req, res) {
    let response = await getSpecificContent(req, "work", "past", req.query.year);
    res.json(response);
});

app.post("/broadcastForm", auth, function (req, res) {
    let response = {};
    let allowedFileFormats = ["zip"];
    let form = new formidable.IncomingForm();
    form.maxFileSize = 10 * 1024 * 1024;
    form.parse(req, function (err, fields, files) {
        if (files.filetoupload.size == 0) { fs.unlinkSync(files.filetoupload.path); response.err = "you need to include a file"; return res.json(response); }
        files.filetoupload.name = files.filetoupload.name.toLowerCase();
        if (!allowedFileFormats.includes(files.filetoupload.name.split(".").pop())) { fs.unlinkSync(files.filetoupload.path); response.err = "wrong file format"; return res.json(response); }
        if (fs.existsSync(__dirname + "/public/temp/images")) {
            let imagesFolder = fs.readdirSync(__dirname + "/public/temp/images");
            imagesFolder.forEach((file) => {
                fs.unlinkSync(__dirname + "/public/temp/images/" + file);
            });
            fs.rmdirSync(__dirname + "/public/temp/images");
        }
        if (fs.existsSync(__dirname + "/public/temp")) {
            let tempFolder = fs.readdirSync(__dirname + "/public/temp");
            tempFolder.forEach((file) => {
                fs.unlinkSync(__dirname + "/public/temp/" + file);
            });
            fs.rmdirSync(__dirname + "/public/temp");
        }
        extract(files.filetoupload.path, { "dir": __dirname + "/public/temp" }, function (err) {
            fs.unlinkSync(files.filetoupload.path);
            if (err) { response.err = err; return res.json(err); }
            console.log("extract ok");
            let temp = fs.readdirSync(__dirname + "/public/temp");
            let htmlFile;
            temp.forEach((file) => {
                if (file.endsWith(".html"))
                    htmlFile = file;
            });
            if (!htmlFile) { response.err = "no HTML file inside"; return res.json(response); }
            let htmlContent = fs.readFileSync(__dirname + "/public/temp/" + htmlFile, "utf8");
            htmlContent = htmlContent.replace(/src="images\//g, `src="cid:`);//works
            // htmlContent = juice(htmlContent); // uncomment this if the css is not applied properly, it detects the <style> tag in <head> and inlines it for each element
            let images = fs.readdirSync(__dirname + "/public/temp/images");
            let imageArray = [];
            images.forEach((file) => {
                imageArray.push(
                    {
                        "filename": file,
                        "path": __dirname + "/public/temp/images/" + file,
                        "cid": file
                    }
                );
            });
            let subject = fields.subject;
            db.collection("subscribers").find().toArray(function (err, foundSubscribers) {
                if (err) { response.err = err; return res.json(response); }
                if (!foundSubscribers.length) { response.err = "you have no subscribers"; return res.json(response); }
                foundSubscribers.forEach(function (subscriber) {
                    sendEmail(subscriber, subject, htmlContent, imageArray);
                });
                response.status = 200;
                res.json(response);
            });//db.collection.find()
        });//extract()
    });//form.parse()
});

app.get("/isLoggedIn", function (req, res) { // used for dynamically adding admin controls to the page
    let response = { "status": 200 };
    if (req.session && req.session.admin)
        response.body = true;
    else
        response.body = false;
    res.json(response);
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//functions
function sendEmail(object, subject, message, attachments) { // function to ease things up
    return new Promise(function (resolve, reject) {
        let footer = "<hr><a href=\"http://localhost:3000/unsubscribe?id=" + object._id + "\">unsubscribe</a>"; // change localhost+port to a domain name
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'vankus4nodemailer@gmail.com',
                pass: 'Nodepls42'
            },
            tls: { rejectUnauthorized: false }
        });
        let mailOptions = {
            from: "vankus4nodemailer@gmail.com",
            to: object.email,
            subject: subject,
            text: message,
            html: message + footer,
            attachments: attachments
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log('Email sent: ' + info.response);
                resolve();
            }
        });
    });
}
async function getSpecificContent(req, type, status, year) {
    status = status || "any"; // if status isn't passed, use "any" as the default value
    year = year || "any";
    let response = {};
    response.descriptions = [];
    response.subdescriptions = [];
    response.subsubdescriptions = [];
    let founds = [];
    let subfounds = [];
    //first check the content folder
    let mongoFiles = [];
    if (req.session && req.session.admin) mongoFiles = await db.collection("content").find({}).toArray();
    else mongoFiles = await db.collection("content").find({ "isVisible": true }).toArray();
    mongoFiles.forEach((file) => {
        if (file.type === type && (file.status === status || status === "any") && (isFromYear(file.timestamp, year) || year == "any")) {
            response.descriptions.push(file);
            founds.push(ObjectId(file._id).toString());
        }
    });
    // then check the subcontent folder
    let mongoSubfiles = await db.collection("subcontent").find({}).toArray();
    mongoSubfiles.forEach((subfile) => {
        if (founds.includes(subfile.dependency)) {
            response.subdescriptions.push(subfile);
            subfounds.push(ObjectId(subfile._id).toString());
        }
    });
    // then check the subsubcontent folder
    let mongoSubsubfiles = await db.collection("subsubcontent").find({}).toArray();
    mongoSubsubfiles.forEach((subsubfile) => {
        if (subfounds.includes(subsubfile.dependency)) {
            response.subsubdescriptions.push(subsubfile);
        }
    });
    //sort everything and send
    response.descriptions.sort(function (a, b) {
        return a.timestamp > b.timestamp ? 1 : (a.timestamp < b.timestamp ? -1 : 0); //if A < B then return 1, else if A > B return -1, zero is unreachable
    });
    response.subdescriptions.sort(function (a, b) {
        return a.timestamp > b.timestamp ? 1 : (a.timestamp < b.timestamp ? -1 : 0);
    });
    response.subsubdescriptions.sort(function (a, b) {
        return a.timestamp > b.timestamp ? 1 : (a.timestamp < b.timestamp ? -1 : 0);
    });
    return response;
}

function isFromYear(timestamp, year) {
    return (Math.trunc(timestamp / 31556952000 + 1970) == year);
}
//functions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//launch the server
const server = app.listen(process.env.PORT || 3009, function (err) { // start the server here
    if (err) {
        console.log("Server couldn't start.");
        server.close(() => { process.exit() });
    }
    //mongodb://heroku_3hkjj1jf:d75usaj6ce9nhmfaadlgjm84g2@ds151612.mlab.com:51612/heroku_3hkjj1jf
    mongo.connect("mongodb://heroku_3hkjj1jf:d75usaj6ce9nhmfaadlgjm84g2@ds151612.mlab.com:51612/heroku_3hkjj1jf", async function (err, database) {
        if (err) {
            console.log("There was an error running mongodb", err.message);
            return server.close(() => { process.exit() });
        }
        db = database;
        let user = await db.collection("users").findOne({});
        if (!user) {
            let username = "username";
            let password = "password";
            let email = "default@default.com";
            console.log(`no admin account, creating one with username "${username}", password "${password}", email "${email}"`);
            bcrypt.hash(password, saltRounds).then(function (hash) {
                let newUser = {
                    "username": username,
                    "password": hash,
                    "email": email
                }
                db.collection("users").insert(newUser, function (err, success) {
                    console.log(success);
                });
            }).catch(function (err) {
                console.log(err);
            });
        }
        console.log("Server started on port", server.address().port);
    });
});