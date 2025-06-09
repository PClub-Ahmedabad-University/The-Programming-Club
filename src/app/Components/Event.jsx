import Image from 'next/image';
import React from 'react';
import ShinyButton from "@/ui-components/ShinyButton";
const Event = ({ event }) => {
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Helper function to format time
  const formatTime = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Build event details array from the event data
  const eventDetails = [
    { detail: "PARTICIPATION", ans: event?.rules?.includes('team') ? "Team" : "Individual" },
    { detail: "DATE", ans: formatDate(event?.date) },
    { detail: "TIME", ans: event.time ? formatTime(event?.date) : "-" },
    { detail: "VENUE", ans: event?.location || "TBD" },
  ];

  return (
    <div className="event-box w-full relative">
        <div className="event-description w-full flex flex-col lg:flex-row justify-evenly lg:mt-5">
            <div className="event-top w-full lg:w-[20%] absolute top-[-6%] lg:top-[-8.5%] left-0 lg:left-[6.7%] mt-5 lg:mt-0">
                <h1 className='font-normal text-xl text-white border rounded-md text-center py-1'>
                  {event?.title || "EVENT NAME"}
                </h1>
            </div>
            <Image 
              src={event?.imageUrl || "/ImageContainer.png"} 
              alt={event?.title || 'Event Image'} 
              className='w-full lg:w-[20%] mt-5 lg:mt-0' 
              height={800} 
              width={800} 
              draggable={false} 
              priority
            />
            <div className="event-content w-full lg:w-[60%] flex flex-col justify-between mt-5 lg:mt-0">
                <p className='event-details w-full text-[#8E8E8E] text-xl'>
                    {event?.description || "Event description will be displayed here."}
                </p>
                
                {/* Show additional details if available */}
                {/* {event?.more_details && (
                  <p className='text-[#A0A0A0] text-lg mt-3'>
                    {event.more_details}
                  </p>
                )} */}

                {/* Show rules if available */}
                {/* {event?.rules && (
                  <p className='text-[#A0A0A0] text-sm mt-2'>
                    <span className='text-white font-medium'>Rules: </span>
                    {event.rules}
                  </p>
                )} */}

                <div className="other-details flex flex-col gap-3 w-full lg:w-3/4 mt-5 lg:mt-0">
                    {eventDetails.map((item, index) => (
                        <div key={index} className="details flex w-full items-center">
                            <h1 className='font-normal text-sm lg:text-lg text-white w-1/2 tracking-[2px]'>{item.detail}</h1>
                            <p className='font-extralight text-sm lg:text-lg text-[#FFFFFF] w-1/2'>{item.ans}</p>
                        </div>
                    ))}
                </div>
                    {event?.registrationOpen ? (
                    <ShinyButton
                        className="w-full lg:w-[20%] mt-7 lg:mt-0"
                        onClick={() => window.open(event.registrationLink, "_blank")}
                        title="Register"
                    />
                    ) : (
                        <span
                        className="border lg:w-[20%] border-gray-400 text-gray-400 rounded-xl px-4 py-2 text-sm cursor-not-allowed select-none flex items-center justify-center"
                    >
                        {"Opening soon.."}
                    </span>
                    )}
            </div>
        </div>
    </div>
  )
}

export default Event