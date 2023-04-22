//jshint esvirsion:6

const express = require('express');
const bp = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const { name } = require('ejs');
const md5 = require('md5');

mongoose.connect("mongodb://127.0.0.1:27017/quizdb");

const app = express();
app.set("view engine","ejs");
app.use(bp.urlencoded({extended:true}));
let n = 0;
let cn=0;
let falsecount=0;
var nam ="";
var again="";
var signupagain="";

const queschema = {
    q: {type:String,require:true, maxLength:500},
    options: [{type:String , maxLength:200}],
    correct: Number
}
const quelistchema = {
    name: String,
    quizlist: [queschema]
}
const userschema = {
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true,
        minLength: 6,
        maxLength: 8
    },
    quizzes: [quelistchema]
}

const question = mongoose.model("question" , queschema);
const quiz = mongoose.model("quiz" , quelistchema);
const user = mongoose.model("user" , userschema);

const que = new question({
    q: "whatismyname?",
    options: ["meet","neel","deep","kavan"],
    correct: 2
})
const que2 = new question({
    q: "whatis your name?",
    options: ["meet","neel","deep","kavan"],
    correct: 0
})
const que3 = new question({
    q: "how are you?",
    options: ["good","v.good","v.v.good","v.v.v.good"],
    correct: 3
})
// que3.save();
const quiz2 = new quiz({
    name:"new",
    quizlist:[que2]
})
// quiz2.save();

const user1 = new user({
    username: "deep22",
    email: "deeppatel6071@gmail.com",
    password: "deepbhut",
    quizzes: [quiz2]
})
// user1.save();
// user.findOneAndUpdate({username: "deep22"} , {$push: {quizzes: {name:"new",quizlist: []}}});

app.get("/" , function(req,res){
    res.render("home")
})

app.get("/login" , function(req,res){
    res.render("userlogin" , {tryy : again});
    again = "";
})

app.get("/signup" , function(req,res){
    res.render("usersignup" , {tryy: signupagain});
    signupagain ="";
})

app.post("/signup" , function(req,res){
    let newuname = req.body.username;
    user.findOne({username: newuname}).then((founduser)=>{
        if(founduser == null){
            console.log("valid user name");
            res.render("signupfinal" , {uname : newuname})
        }
        else{
            signupagain= "This username is already taken!";
            res.redirect("/signup")
        }
    })
})

app.post("/signedup/:user" , function(req,res){
    console.log(req.body);
    var user1 = new user({
        username: req.body.username,
        email: req.body.mail,
        password: req.body.password,
        quizzes: []
    })
    user1.save();
    console.log("saved");
    res.redirect("/:"+req.params.user);
})

app.post("/login/username" , function(req,res){
    const uname = req.body.username;
    // console.log(uname);
    user.findOne({username: uname}).then((foundusers)=>{
        if(foundusers == null){
            console.log("no users found");
            again = "No user found with entered username\nhaven't signed up yet?";
            res.redirect("/login")
        } 
        else{
            res.render("loginfinal" , {uname: uname});
            // console.log(foundusers);
        }
    })
})

app.post("/:user" , function(req,res){
    const uname = req.params.user;
    user.findOne({username: uname}).then((founusers)=>{
        let quizzes = founusers.quizzes;
        if(quizzes.length == 0){
            res.render("quizlist" , {q: founusers.quizzes, uname: uname});
        }
        else{
            res.render("quizlist" , {q: founusers.quizzes , uname: uname}); 
            // console.log("nono");   
        }
    })
})

app.get("/:user/compose" , function(req,res){
    let uname = req.params.user;
    // console.log(uname);
    res.render("compose",{uname: uname})
})
app.post("/:user/compose" , function(req,res){
    // console.log(req.params.user);
    // console.log(req.body.qnums);
    let name = req.body.qname;
    let num = req.body.qnums;
    let list = [];
    // quiz.create({name:name , quizlist:list}).then((added)=>{
    // });
    user.findOneAndUpdate({username: name} , {$push: {quizzes: quiz.create({name:name , quizlist:list})}}).then((users)=>{
        if(users) console.log(users);
    })
    res.render("compque", {uname: req.params.user , numofque: req.body.qnums})
})

app.post("/:user/compose/ques" , function(req,res){
    // console.log(req.params.user);
    // console.log(req.body);

})

app.get("/questions/:user/:quizname" , function(req,res){
    let uname = req.params.user;
    let qname = req.params.quizname;
    // console.log(uname +" "+qname);
    user.findOne({username: uname}).then((foundusers)=>{
        let quizzes = foundusers.quizzes;
        if(quizzes.length == 0){
            console.log("no quizzes");
        }
        else{
            quiz.findOne({name: qname}).then((foundquiz)=>{
                let ques = foundquiz.quizlist;
                if(ques.length == 0){
                    console.log("no ques");
                }
                else{
                    if(n < ques.length){
                        res.render("quiz" , {q: ques[n].q , opt:ques[n].options , cor : ques[n].correct, nam:req.params.para, qname: qname, uname: uname , ans:foundquiz})
                    }
                    else{
                        res.render("complete",{uname: uname , qname: qname, total: ques.length});
                        
                    }
                }
            })
        }
    })
})

app.post("/questions/:user/:quizname" , function(req,res){
    // console.log(req.body);
    let uname = req.params.user;
    let qname = req.params.quizname;
    // console.log(uname+" "+qname);
    if(req.body.chbx === req.body.hid){
        console.log("correct");
        n++;
        res.redirect("/questions/"+uname+"/"+qname);
    }

    else{
        falsecount++;
        n++;
        res.redirect("/questions/"+uname+"/"+qname);     
        }
})

app.get("/questions/:user/:quizname/results" , function(req,res){
    let total = req.body.total;
    console.log(total);
    res.render("result" , {nof : falsecount, tot: total});
    n=0;
    falsecount=0;
})
// quiz2.save();

// app.get("/" , function(req,res){
//     quiz.find({}).then((foundquiz)=>{
//         if(!foundquiz) res.render("quizlist" , {q:-1});
//         else res.render("quizlist",{q:foundquiz})
//     })
// })

// app.get("/:para" , function(req,res){
//     nam = req.params.para;
//     quiz.findOne({name : nam}).then((quiz)=>{
//         if(quiz===null) res.send("not");
//         else if(quiz.name === nam ) {
//             console.log(quiz.name);
//             let qn = quiz.quizlist;
//             console.log(qn.length);
           
//             if(n < qn.length){
//                 res.render("quiz" , {q: qn[n].q , opt:qn[n].options , cor : qn[n].correct, nam:req.params.para})
//             }
//             else{
//                 res.render("result" , {nof : falsecount, total: qn.length});
//                 n=0;
//                 falsecount=0;
//             }
//         }
//         else res.send("not");
//     })
// })


// app.post("/:para" , function(req,res){
//     // console.log(req.params.para);
//     if(req.body.chbx === req.body.hid){
//         console.log("correct");
//         // console.log(req.params.para);
//         n++;
//         res.redirect("/"+req.params.para);
//     }
//     else{
//         falsecount++;
//         n++;
//         res.redirect("/"+req.params.para);
        
//     }
// })
// app.get("/:para/delete" , function(req,res){
//     let n = req.params.para;
//     console.log(n);
//     quiz.findOneAndRemove({name : n}).then((err)=>{
//         console.log(err);
//     })
//     res.redirect("/")
// })

// app.get("/new/compose" , function(req,res){
//     res.render("compose");

// })

// app.post("/new/compose" , function(req,res){
//     var name = req.body.qname;
//     let num = req.body.qnums;
//     let list = [];
//     quiz.create({name:name , quizlist:list});
//     res.render("compque" , {name:name , numofque:num})
// })

// // app.get("/new/compose/que" , function(req,res){
// //     console.log(name);
// //     res.render("compque")
// // })


// let qlist = [];
// app.post("/new/compose/que" , function(req,res){
//     let q = req.body.qnam;
//     let options = req.body.opts;
//     let ans = req.body.correctnum;
//     let total = req.body.numss;
    
//     console.log(total);
//     console.log(req.body.quizname);
//     if(cn < total){
//         const obj = new question({
//             q: q,
//             options: options,
//             correct: ans
//         })
//         qlist.push(obj);
//         console.log(qlist);
//         quiz.findOneAndUpdate({name : req.body.quizname},{$push: {quizlist : obj}}).then((err)=>{
//             if(err) console.log(err);   
//         });
//         cn++;
//         if(cn!=total)
//         res.render("compque" , {name:req.body.quizname , numofque:total})
//         else res.redirect("/")
//     }
//     else{
//         cn=0;
//         res.redirect("/");

//     }
    
// })

app.listen(3000 , function(){
    console.log("server is running on port 3000");
})