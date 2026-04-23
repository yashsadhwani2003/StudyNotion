import React from 'react'
import {Swiper, SwiperSlide} from "swiper/react"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import { Autoplay,FreeMode,Navigation, Pagination}  from 'swiper/modules'
import Course_Card from './Course_Card'

const CourseSlider = ({Courses}) => {
  return (
    <>

        {
            Courses?.length ? (
                <Swiper
                    slidesPerView={3}
                    spaceBetween={25}
                    loop={true}
                    freeMode={true}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    modules={[FreeMode, Pagination, Autoplay]}
                    className='w-full'
                >

                    {
                        Courses?.map((course,i) => (
                            <SwiperSlide>
                                <Course_Card course={course} Height={"h-[250px]"}/>
                            </SwiperSlide>
                        ))
                    }

                </Swiper>
            ) : (
                <p className="text-xl text-richblack-5">No Course Found</p>
            )
        }
      
    </>
  )
}

export default CourseSlider
