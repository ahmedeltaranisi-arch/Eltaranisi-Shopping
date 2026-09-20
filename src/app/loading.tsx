import React from 'react'
import { ClipLoader } from 'react-spinners'

export default function loading() {
  return (
 <div className='h-screen bg-gray-300 flex justify-center items-center'>
   
    <ClipLoader color='#008000'/>

 </div>
  )
}
