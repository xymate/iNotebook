const express=require('express');
const router=express.Router()
const fetchuser=require('../middleware/fetchuser')
const Notes=require('../models/notes')
const {body,validationResult}=require('express-validator');
const notes = require('../models/notes');

//ROUTE 1: Get all the notes GET: api/auth/fetchallnotes
router.get('/fetchallnotes',fetchuser,async (req,res)=>{
    try {
        const notes=await Notes.find({ user:req.user.id})
    res.json(notes)
    } catch (error) {
        console.log(error.message);
        res.status(500).send("internal server error")
    }
    
})

//ROUTE 2: create a note using POST: api/auth/addnote
router.post('/addnote',fetchuser,[
    body('title','enter a valid title').isLength({min:3}),
    body('description','enter a valid description').isLength({min:5}),
],async (req,res)=>{
    try {

        const {title,description,tag}=req.body
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.array()});
    }
    const note= new Notes({
        title, description, tag, user:req.user.id

    })
    const savednote=await note.save()
    res.json(savednote)
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send("internal server error")
    }
    
    
})

//ROUTE 3: Update an existing Note using POST: api/auth/updatenote
router.put('/updatenote/:id',fetchuser,async (req,res)=>{
    const {title,description,tag}=req.body
    //create a new object
    const newNote={};
    if(title){
        newNote.title=title
    }
    if(description){
        newNote.description=description
    }
    if(tag){
        newNote.tag=tag
    }
    //find the note to be updated an update it
    let note=await notes.findById(req.params.id)
    if(!note){
       return res.status(400).send("not found")
    }
    if(note.user.toString()!=req.user.id){
        return res.status(401).send("not allowed")
    }
    note=await notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
    res.json({note})
})

//ROUTE 4 : deleting a note using DELETE: api/notes/deletenote/:id 
router.delete('/deletenote/:id',fetchuser,async (req,res)=>{
    const {title,description,tag}=req.body
    
    
    //find the note to be deleted an delete it
    let note=await notes.findById(req.params.id)
    if(!note){
       return res.status(400).send("not found")
    }
    //allow deletion only if user owns this note
    if(note.user.toString()!=req.user.id){
        return res.status(401).send("not allowed")
    }
    note=await notes.findByIdAndDelete(req.params.id)
    res.json({"sucsess" : " Note has been deleted"})
})



module.exports=router