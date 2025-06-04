import React from 'react'
import Event from './Event'

const UpcomingEventBox = () => {
  return (
    <section className='px-8 md:px-16 lg:px-25 mb-3 lg:mt-5 lg:mb-20 font-inter'>
        <div className="section-name w-full text-center">
            <h1 className='font-bold text-2xl md:text-3xl lg:text-5xl text-[#00C8FF] border-[3px] border-[#008DF3] inline-block px-5 py-3 rounded-lg'>UPCOMNG EVENTS</h1>
        </div>
        <div className="upcoming-events-container flex flex-col mt-15 gap-20">
          <Event/>
          <Event/>
        </div>
    </section>
  )
}

export default UpcomingEventBox