const express = require('express')
const router = express.Router()

const User = require("./../models/user");
const {jwtAuthMiddleware,generateToken} = require('./../jwt')

router.post("/signup",async (req, res) => {
    try{
      const body = req.body;
      const newUser = new User(body);
  
      const response = await newUser.save()
      console.log('Data Saved')

      const payload = {
        id : response.id 
      }
      console.log(JSON.stringify(payload)) ;
      const token = generateToken(payload);

      res.status(200).json({response: response, token: token});
    }catch(err){
      console.log(err)
      res.status(500).json({error : 'Internal Server Error'})
    }
})

//Login Route
router.post('/login',async(req,res) => {
  try{
    //Extracting login credentials
    const {aadharCardNumber,password} = req.body ;

    //finding by username
    const user = await User.findOne({aadharCardNumber: aadharCardNumber})

    if(!user || !(await user.comparePassword(password))){
      return res.status(401).json({error : 'Wrong Username or Password'})
    }

    //Generating Token
    const payload = {
      id : user.id
    }
    const token = generateToken(payload) ;
    
    res.json({token});

  }catch(err){
    console.log(err)
    res.status(500).json({error : 'Internal Server Error'})
  }
})

router.get('/profile', jwtAuthMiddleware, async (req, res) => {
  try{
      const userData = req.user;
      const userId = userData.id;
      const user = await User.findById(userId);
      res.status(200).json({user});
  }catch(err){
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
})

router.put('/profile/password',jwtAuthMiddleware, async(req , res) => {
    try{
        const userId = req.user.id ;
        const {currentPassword , newPassword} = req.body ;
        const user = await User.findById(userId)
        
        //if pass doesn't match
        if(!(await user.comparePassword(password))){
          return res.status(401).json({error : 'Wrong Username or Password'})
        }

        user.password = newPassword ;
        await user.save() ;

        console.log('Password Updated')
        res.status(200).json({message: 'Password Updated'});

    }catch(err){
        console.log(err)
        res.status(500).json({error : 'Internal Server Error'})
    }
})

module.exports = router ;