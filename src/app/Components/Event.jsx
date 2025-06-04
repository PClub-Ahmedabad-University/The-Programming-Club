import Image from 'next/image';
import React from 'react';

const Event = () => {
  const eventDetails = [
    { detail: "TEAM/PARTICIPATION", ans: "Individual" },
    { detail: "DATE", ans: "28th November 2022" },
    { detail: "TIME", ans: "3:00 PM" },
    { detail: "VENUE", ans: "Kholi Number 420" },
  ];

  return (
    <div className="event-box w-full">
        <div className="event-left w-[20%] ms-25">
            <h1 className='font-normal text-xl text-white border rounded-md text-center py-1'>EVENT NAME</h1>
        </div>
        <div className="event-description w-full flex justify-evenly mt-5">
            <Image src="/ImageContainer.png" alt='Image Container' className='w-[20%]' height={800} width={800} draggable={false} priority/>
            <div className="event-content w-[60%] flex flex-col justify-between">
                <p className='event-details w-full text-[#8E8E8E] text-xl'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <div className="other-details flex flex-col gap-3 w-3/4">
                    {eventDetails.map((item,index) => (
                        <div key={index} className="details flex w-full items-center">
                            <h1 className='font-normal text-lg text-white w-1/2 tracking-[2px]'>{item.detail}</h1>
                            <p className='font-extralight text-[#FFFFFF] w-1/2'>{item.ans}</p>
                        </div>
                    ))}
                </div>
                <button className='register font-normal text-lg text-[#40E9F1] border-[3px] border-[#40E9F1] w-[20%] py-1 rounded-lg shadow-sm shadow-cyan-400/50'>
                    REGISTER
                </button>
            </div>
        </div>
    </div>
  )
}

export default Event