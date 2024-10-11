import express from "express"
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
const app=express();
const port =3000
const today = new Date();
let day = today.getDay();
app.use(bodyParser.urlencoded({extended:true}))


app.get("/",(req,res)=>{
    if (day===0 || day===6) {
        res.render("index.ejs",{y:"week end party"});
    }
    else{
        res.render("index.ejs",{y:"Work"})
    }
})











app.listen(port,()=>{
    console.log(`i am running on ${port}`)
})