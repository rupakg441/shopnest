import react from "react"

import {useState} from "react"

const sum = react.memo(({nums})=>{
    console.log("child")
    const sum=()=>{

        let sum = 0;    
            for(let i = 0; i<nums; i++){
                sum+=i;
            }

            return sum;
    }

    return <><h1>
        {
         sum()   
        }
        </h1></>

});

export default sum;