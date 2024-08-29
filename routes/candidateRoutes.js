const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const Candidate = require("./../models/candidate");


const checkAdmin = async (userID) => {
  console.log(userID)
  try {
    const user = await User.findById(userID);
    if (user.role === 'admin') {
      return true;
    }
  } catch {
    return false ;
  }
};

router.post("/",jwtAuthMiddleware, async (req, res) => {
  //console.log(req.user)
  try {
    if (!(await checkAdmin(req.user.userData.id)))
      return res.status(403).json({ message: "User is not Admin" });

    const body = req.body;
    const newCandidate = new Candidate(body);

    const response = await newCandidate.save();
    console.log("Data Saved");
    res.status(200).json({ response: response });

  } catch (err) {
    console.log(err) ;
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user.id)))
      return res.status(403).json({ message: "user is not Admin" });

    const candidateId = req.params.candidateId;
    const updatedCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(candidateId,updatedCandidateData,{
        new: true,
        runValidators: true,
      })

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    console.log("Updated Succesfully");
    res.status(200).json(response);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user.userData.id)))
      return res.status(403).json({ message: "user is not Admin" });
    
    candidateId = req.params.candidateId ;
    const response = await Candidate.findByIdAndDelete(candidateId);

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    console.log("Deleted Succesfully");
    res.status(200).json(response);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/vote/:candidateId', jwtAuthMiddleware,async(req,res)=>{
  candidateId = req.params.candidateId ;
  userId = req.user.userData.id;

  try{
    //Find the Candidate
    const candidate = await Candidate.findById(candidateId)
    if(!candidate)
      res.status(404).json({message : 'Candidate not found'});

    const user = await User.findById(userId);
    if(!user)
      res.status(404).json({message : 'User not found'});

    if(user.isVoted){
      res.status(400).json({message: 'You have already voted'})
    }
    if(user.role === 'admin'){
      res.status(403).json({message: 'Admin is not allowed'})
    }

    candidate.votes.push({user : userId})
    candidate.voteCount ++ ;
    await candidate.save() ;

    user.isVoted = true ;
    await user.save();

    res.status(200).json({message : 'Vote recorded Successfully'})
  
  }catch(err){
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

router.get('/vote/count' , async(req,res) => {
  try{
    //Find all the candidates and sort them by votecount
    const candidate = await Candidate.find().sort({voteCount :'desc'})

    const voteRecord = candidate.map((data) => {
      return {
        party : data.party,
        count : data.voteCount
      }
    })

    return res.status(200).json(voteRecord)

  }catch(err){
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

router.get('/',async (req,res) => {
  try{
    const candidate = await Candidate.find().sort({voteCount :'desc'})

    const voteRecord = candidate.map((data) => {
      return {
        name : data.name ,
        party : data.party
      }
    })
    return res.status(200).json(voteRecord)

  }catch(err){
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

module.exports = router;
