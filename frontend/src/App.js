import { useState, useEffect } from "react"
import axios from "axios"
import * as XLSX from "xlsx"

function App() {
  const [msg, setmsg] = useState("")
  const [status, setstatus] = useState(false)
  const [emailList, setEmailList] = useState([])
  const [subject, setsubject] = useState("")
  const [history, sethistory] = useState([])

  useEffect(function () {
    axios.get("https://bulkmail-mern-two.vercel.app/emailhistory").then(function (data) {
      sethistory(data.data)
    }).catch(function (error) {
      console.log(error)
    })
  }, [])

  function handlemsg(event) {
    setmsg(event.target.value)
  }

  function handlefile(event) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = function (event) {
      const data = event.target.result
      const workbook = XLSX.read(data, { type: "binary" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const emailList = XLSX.utils.sheet_to_json(worksheet, { header: "A" })
      const totalemail = emailList.map(function (item) { return item.A })
      setEmailList(totalemail)
    }

    reader.readAsBinaryString(file)
  }

  function send() {
    setstatus(true)

    axios.post("https://bulkmail-mern-two.vercel.app/sendemail", {
      subject: subject,
      msg: msg,
      emailList: emailList
    })
      .then(function (data) {
        if (data.data === true) {
          alert("Email sent successfully")
          axios.get("https://bulkmail-mern-two.vercel.app/emailhistory").then(function (result) {
            sethistory(result.data)
          })
        }
        else {
          alert("Failed")
        }
        setstatus(false)
      })
      .catch(function (error) {
        console.log(error)
        alert("Error sending email")
        setstatus(false)
      })
  }

  return (
    <div>
      <div className="bg-blue-950 text-white text-center">
        <h1 className="text-xl font-medium px-5 py-2">BulkMail</h1>
      </div>
      <div className="bg-blue-800 text-white text-center">
        <h1 className="text-sm font-medium px-5 py-2">We can help your business with sending multiple emails at once</h1>
      </div>
      <div className="bg-blue-600 text-white text-center">
        <h1 className="text-sm font-medium px-5 py-2">Drag and Drop</h1>
      </div>
      <div className="bg-blue-400 text-center p-4">
        <input type="text" placeholder="Enter email subject" value={subject} onChange={(e) => setsubject(e.target.value)} className="border p-2 w-full rounded" />
        <textarea onChange={handlemsg} value={msg} className="w-[80%] h-24 mt-5 py-2 outline-none px-2 border border-black rounded-md" placeholder="Enter the email text ...."></textarea>
        <div className="border-4 border-dashed py-3 px-3 mt-3 mb-4 w-fit mx-auto">
          <input type="file" onChange={handlefile} />
        </div>
        <p className="text-black text-sm">Total Emails in the file: {emailList.length}</p>
        <button onClick={send} className="mt-2 mb-2 bg-blue-950 py-1 px-2 text-white text-sm font-medium rounded-md w-fit">
          {status ? "Sending.." : "Send"}
        </button>
      </div>
      <div className="bg-blue-300 text-center p-6">
        <h1 className="text-xl font-bold">Email History</h1>
        {history.map(function (item, index) {
          return (
            <div key={item._id} className="bg-white text-black p-4 m-3 rounded-md text-left">
              <h2 className="font-bold">{item.subject}</h2>
              <p>{item.body}</p>
              <p>Recipients: {item.recipients.join(", ")}</p>
              <p>Status: {item.status}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
