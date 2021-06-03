const mongoose = require("../config/dbconfig.js")
const ObjectId = mongoose.Types.ObjectId;

module.exports =(id)=>{
    if(ObjectId.isValid(id)){
        if((String)(new ObjectId(id)) === id)
            return true;        
        return false;
    }
    return false;
}