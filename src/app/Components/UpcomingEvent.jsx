import React from 'react';
import { FaRegCalendarAlt } from "react-icons/fa";

const UpcomingEvent = () => {
  return (
    <>
    <div className="upcoming-event-box lg:w-3/5 h-24 flex flex-col py-3 mt-10 rounded-md bg-[linear-gradient(90deg,_#026C71_0%,_#004457_100%)] shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)]">
      <div className="box-top w-full flex justify-between items-center text-white text-sm px-4">
          <div className="event-date flex items-center gap-3">
              <FaRegCalendarAlt color='white' size={23}/>
              <p className='date mt-1'>22/06/2025</p>
          </div>
          <p className='event-type'>Upcoming Event</p>
      </div>
      <div className="line h-[1px] w-full bg-white my-3"></div>
      <div className="event-details flex justify-between items-center px-4 text-white text-sm">
        <li>WMC 6.0</li>
        <p className='event-time'>18:00</p>
      </div>
    </div>
    </>
  )
}

export default UpcomingEvent