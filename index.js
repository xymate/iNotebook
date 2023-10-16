const connectToMongo=require('./db');
const express= require('express');
const cors=require('cors');
connectToMongo();
const app =express();
const port=5000; 

// app.get('/',(req,res)=>{
//     res.send('hello Yash!'); 
// })

app.use(cors());

app.use(express.json())

app.use('/api/auth',require('./routes/auth'))

app.use('/api/notes',require('./routes/notes'))

app.listen(port,()=>{
    console.log(`the iNotebook app is running  at : http://localhost:${port}`)
})