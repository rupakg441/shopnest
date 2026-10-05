import { useMemo, useState, useEffect, useCallback } from "react"

import Sum from '../../components/child/sum';

const LearnUseMemoHook = () => {


    const [formData, setFormData] = useState({
        name: "",

        email: "",
        description: ""
    })

    const   handleOnSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch("/contactus").json();
        console.log(response);


    }


    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })

    }
console.log(formData);
    return (

        <div className="col-md-12">

            <form onSubmit={(e)=>handleOnSubmit(e)} className="flex gap-2 border-t border-outline-variant/30 p-3">
                <div className="flex items-center flex-1 max-w-md">

                    <input onChange={(e) => handleFormChange(e)} type="text" value={formData?.name} placeholder="Enter Name" name="name" className="min-w-0 flex-1 rounded-lg border border-outline-variant/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
                    />         </div>                    <div className="flex items-center flex-1 010 bm">

                    <textarea onChange={(e) => handleFormChange(e)} value={formData?.description} placeholder="Enter description" name="description" className="min-w-0 flex-1 rounded-lg border border-outline-variant/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
                    />  </div>                       <div className="flex items-center flex-1 max-w-md">

                    <input onChange={(e) => handleFormChange(e)} value={formData?.email} placeholder="Enter email" name="email" className="min-w-0 flex-1 rounded-lg border border-outline-variant/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <button               className="bg-primary text-on-primary px-8 py-4 rounded-xl font-button text-button w-full md:w-auto hover:opacity-90 transition-opacity tracking-wider shadow-sm"
> Submit</button>
                    </div>


            </form>

        </div>
    )


}


export default LearnUseMemoHook;