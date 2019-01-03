const express = require('express');
const nodemailer = require('nodemailer');
const db = require('../db/connection');
const router = express.Router();
const randomstring = require('randomstring');

router.get('/', (req,res) => {
    if(!(req.session.user === undefined)){
        if(!(req.session.flag)){
            res.render('auth.ejs',{
                id:req.session.user,
                school : req.session.school
            });
        }
        else{
            res.redirect('/');
        }
    }
    else
        res.redirect('/');
})
.post('/', (req,res) => {
    if(req.session.flag){
        res.redirect('/');
    }
    else{
        const key = req.body.key; 
        const email = req.body.email;
        console.log(key,email)
        if(!(req.body.key===undefined)){
            db.query('select AUTHKEY from Users where ID = ?',req.session.user,(err,result) => {
                if(err) throw err;
                if((key === result[0].AUTHKEY)){
                    db.query('update Users set FLAG=1 where ID = ?',req.session.user);
                    req.session.flag = 1;
                    req.session.save(() => {
                        res.redirect('/');
                    })
                }
                else
                    res.send('<script type="text/javascript">alert("인증실패!(ꐦ°д°)");window.location.href="auth";</script>');
            })
        }
        else{
            db.query('select * from Users where EMAIL = ?',req.body.email,(err,result) => {
                if(err) console.log(err);
                if(!(result.length === 0))
                es.send('<script type="text/javascript">alert("중복되는 이메일이에요!(ノ ̿ ̿ᴥ ̿ ̿)ノ");window.location.href="auth";</script>');
                else{
                    const authkey = randomstring.generate();
                    db.query('update Users set AUTHKEY = ?, EMAIL = ? where ID = ?',[authkey,email,req.session.user]);
                    res.send('<script type="text/javascript">alert("인증메일을 다시 보냈어요!(●•̀ ω •́●)");window.location.href="auth";</script>');
                    const transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: 'teamlogsr@gmail.com', 
                            pass: 'teamlogzzang2017'
                        }
                    });
                    const mailOptions = {
                        from: 'teamlogsr@gmail.com',
                        to: email ,
                        subject: 'LOGCON 인증',
                        text: '가입완료를 위해 <'+authkey+'> 를 입력해주세요'
                    };
                    transporter.sendMail(mailOptions, (err, response) => {
                        if(err)
                            console.log(err);
                        else{
                            console.log('sibal',response);
                        }   
                    })
                }
            })
        }
    }
})


module.exports = router;
