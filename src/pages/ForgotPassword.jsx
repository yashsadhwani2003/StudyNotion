import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { getPasswordResetToken } from '../services/operations/authAPI';
import {BiArrowBack} from 'react-icons/bi'

const ForgotPassword = () => {

    const [emailSent, setEmailSent] =useState(false);
    const [email, setEmail] = useState("");

    const { loading } =useSelector((state) => state.auth);

    const dispatch = useDispatch()

    const handleOnSubmit = (e) => {
        e.preventDefault()
        dispatch(getPasswordResetToken(email, setEmailSent))
    }
  return (
    <div className='grid min-h-[calc(100vh-3.5rem)] place-items-center'>
      {
        loading ? (<div className="spinner"> Loading .. ..</div>)
         : (
            <div className='max-w-[500px] p-4 lg:p-8'>
                <h1 className='text-[1.875rem] font-semibold leading-[2.375rem] text-richblack-5'>
                    {
                        emailSent ? "Check email" : "Reset your password"
                    }
                </h1>

                <p className='my-4 text-[1.125rem] leading-[1.625rem] text-richblack-100'>
                    {
                        emailSent ? `We have sent the reset email to ${email}` : "Have no fear. We’ll email you instructions to reset your password. If you dont have access to your email we can try account recovery"
                    }
                </p>

                <form onSubmit={handleOnSubmit}>
                    {
                        !emailSent && (
                            <label className='w-full'>
                                <p className='mb-1 text-richblack-5 text-[0.875rem] leading-[1.375rem]'>Email Address <sup className='text-pink-200'>*</sup></p>
                                <input 
                                    required
                                    type='email'
                                    name='email'
                                    value={email}
                                    placeholder='Enter Your Email'
                                    onChange={(e) => setEmail(e.target.value)}
                                    className='form-style w-full'
                                />
                            </label>
                        )
                    }

                    <button type='submit' className='mt-6 w-fit rounded-[8px] bg-yellow-50 py-[12px] px-[12px] font-medium text-richblack-900'>
                        {
                            emailSent ? "Resend email" : "Reset Password"
                        }
                    </button>

                    <div className='mt-6 flex items-center justify-between'>
                        <Link to='/login'>
                           <p className='flex items-center gap-x-2 text-richblack-5'> <BiArrowBack />Back to Login</p>
                        </Link>
                    </div>
                </form>
            </div>
         )
      }
    </div>
  )
}

export default ForgotPassword
