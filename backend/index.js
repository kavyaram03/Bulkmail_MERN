
const express = require("express")
const cors = require("cors")
const nodemailer = require("nodemailer")
const mongoose = require("mongoose")
const app = express()

app.use(express.json())
app.use(cors())

mongoose.connect("mongodb://kavya:123@ac-4dieqrt-shard-00-00.vn0ywtf.mongodb.net:27017,ac-4dieqrt-shard-00-01.vn0ywtf.mongodb.net:27017,ac-4dieqrt-shard-00-02.vn0ywtf.mongodb.net:27017/passkey?ssl=true&replicaSet=atlas-bozgfk-shard-0&authSource=admin")
.then(function () {
    console.log("Connected to DB")
})
.catch(function (error) {
    console.log("Failed to connect")
    console.log(error.message)
    console.log(error.code)
})
const credential = mongoose.model("credential", {user:String, pass:String}, "bulkmail")

const EmailHistory = mongoose.model("EmailHistory", {
    subject: String,
    body: String,
    recipients: Array,
    status: String
}, "emailhistory")


app.post("/sendemail", async function (req, res) {
    var subject = req.body.subject
    var msg = req.body.msg
    var emailList = req.body.emailList

    const history = new EmailHistory({
        subject: subject,
        body: msg,
        recipients: emailList,
        status: "Pending"
    })

    try {
        await history.save()

        var data = await credential.find()

        if (data.length == 0) {
            history.status = "Failed"
            await history.save()
            return res.send(false)
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: data[0].user,
                pass: data[0].pass,
            },
        })

        for (var i = 0; i < emailList.length; i++) {
            await transporter.sendMail({
                from: data[0].user,
                to: emailList[i],
                subject: subject,
                text: msg
            })
            console.log("Email sent to: " + emailList[i])
        }

        history.status = "Sent"
        await history.save()
        res.send(true)
    }
    catch (error) {
        console.log(error)
        history.status = "Failed"
        await history.save()
        res.send(false)
    }
})

app.get("/emailhistory", function (req, res) {
    EmailHistory.find().then(function (data) {
        res.send(data)
    }).catch(function (error) {
        console.log(error)
        res.send(false)
    })
})

app.listen(5000, function () {
    console.log("server started")
})