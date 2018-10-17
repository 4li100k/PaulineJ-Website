
$(document).ready(function () {
    $("#submit_btn").click(function(e){
        e.preventDefault();
        let user_mail = $("#submit_form").find("input[name='email']").val();
        let user_info = {
            "user_mail": user_mail,
        }; 
        $.ajax({
            type: "POST",
            url: "/subscribe-test",
            data: user_info,
        }).done(function(res){
            $("#submit_form").find("input[name='email']").val(" ");
            console.log("res.json: " + res.json);
            if(res.status === 200){
                console.log(res.status);
            }
        });    
    });
});    
