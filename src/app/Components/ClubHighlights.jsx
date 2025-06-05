import Image from 'next/image';
import React from 'react';

const ClubHighlights = () => {
  const boxDetails = [
    {title: "Learn and Grow", description: "Access programming workshops, tutorials and resources to take your coding skills to the next level.", image: "/growth.png", bgColor: "bg-[linear-gradient(90deg,_#00C8FF_0%,_#006884_100%)]"},
    {title: "Collaborate & Innovate", description: "Join a vibrant community of like-minded programmers, work on projects, and build cool stuff together.", image: "/innovate.png", bgColor: "bg-[linear-gradient(90deg,_#006884_0%,_#00546C_100%)]"},
    {title: "Compete & Win", description: "Participate in coding competitions and hackathons to showcase your skills and win exciting prizes.", image: "/compete.png", bgColor: "bg-[linear-gradient(90deg,_#00546C_0%,_#003240_100%)]"},
  ];

  return (
    <section className="club-highlights px-8 md:px-16 lg:px-25 mb-3 lg:mt-20 lg:mb-10">
        <div className="club-highlights-boxes flex flex-col gap-15 lg:flex-row lg:gap-0 w-full justify-between min-h-[200px]">
            {boxDetails.map((item,index) => (
                <div
                    key={index}
                    className={`box w-full lg:w-[28%] px-7 py-7 font-inter text-center rounded-md relative ${item.bgColor} text-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)]`}
                    whileHover={{boxShadow: 0, transition: {duration: 0.3, ease: "easeIn"}}}
                >
                    <div className="image-circle h-12 w-12 flex justify-center items-center rounded-full absolute top-[-24px] left-[43%] bg-[linear-gradient(90deg,_#026C71_0%,_#004457_100%)] shadow-xl">
                        <Image src={item.image} alt='image' height={30} width={30} className='p-0.5'/>
                    </div>
                    <h1 className='font-bold text-[18px] mt-4 mb-2'>{item.title}</h1>
                    <p className='font-normal text-[16px]'>{item.description}</p>
                </div>
            ))}
        </div>
    </section>
  )
}

export default ClubHighlights