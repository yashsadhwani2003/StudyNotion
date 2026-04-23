import React from 'react'
import Logo1 from '../../../assets/TimeLineLogo/Logo1.svg'
import Logo2 from '../../../assets/TimeLineLogo/Logo2.svg'
import Logo3 from '../../../assets/TimeLineLogo/Logo3.svg'
import Logo4 from '../../../assets/TimeLineLogo/Logo4.svg'
import TimeLineImg from '../../../assets/Images/TimelineImage.png'


const data=[
        {
            name:"Leadership",
            desc:"Fully committed to the success company",
            logo:Logo1
        },
        {
            name:"Responsibility",
            desc:"Students will always be our top priority",
            logo:Logo2
        },
        {
            name:"Flexibility",
            desc:"The ability to switch is an important skills",
            logo:Logo3
        },
        {
            name:"Solve the problem",
            desc:"Code your way to a solution",
            logo:Logo4
        }
    ]


const TimeLine = () => {
  return (
    <div>

        <div className='flex flex-col lg:flex-row gap-20 mb-20 items-center'>

            <div className='lg:w-[45%] flex flex-col gap-14 lg:gap-3'>
                {
                    data.map((element,index)=>{
                        return (
                            <div className='flex flex-col lg:gap-3' key={index}>
                                <div className='flex gap-6'>
                                    <div className='w-[52px] h-[52px] bg-white rounded-full flex justify-center items-center shadow-[#00000012] shadow-[0_0_62px_0]'>
                                        <img src={element.logo} alt='logo' className='mx-auto'/>
                                    </div>
                                    <div>
                                        <h2 className='font-semibold text-[18px]'>{element.name}</h2>
                                        <p className='text-base'>{element.desc}</p>
                                    </div>
                                </div>

                                <div
                                    className={`hidden ${
                                        data.length - 1 === index ? "hidden" : "lg:block"
                                    }  h-14 border-dotted border-r border-richblack-100 bg-richblack-400/0 w-[26px]`}
                                ></div>
                            </div>
                        )
                    })
                }
            </div>


            <div className='relative w-fit h-fit shadow-blue-200 shadow-[0px_0px_30px_0px]'>

            

                <div className='absolute lg:left-[50%] lg:bottom-0 lg:translate-x-[-50%] lg:translate-y-[50%] bg-caribbeangreen-700 flex lg:flex-row flex-col text-white uppercase py-5 gap-4 lg:gap-0 lg:py-10'>

                    <div className='flex items-center gap-5 lg:border-r border-caribbeangreen-300 px-7 lg:px-14'>
                        <h1 className='text-3xl font-bold w-[75px]'>10</h1>
                        <h1 className='text-sm text-caribbeangreen-300 w-[75px]'>Years of Experience</h1>
                    </div>

                    <div className='flex gap-5 items-center lg:px-14 px-7'>
                        <h1 className='text-3xl font-bold w-[75px]'>250</h1>
                        <h1 className='text-sm text-caribbeangreen-300 w-[75px]'>Type of Courses</h1>
                    </div>
                    <div></div>
                </div>
                <img 
                    src={TimeLineImg} 
                    alt='timelineimg' 
                    className=' shadow-white shadow-[20px_20px_0px_0px] object-cover h-[400px] lg:h-fit'
                
                />

            </div>

        </div>

    </div>
  )
}

export default TimeLine
