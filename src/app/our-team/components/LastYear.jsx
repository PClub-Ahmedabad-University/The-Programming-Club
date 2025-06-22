import React from 'react';
import Image from 'next/image';
import { ShineBorder } from '@/ui-components/ShinyBorder';

const LastYear = ({ member }) => {
    return (
        <div className="relative group overflow-hidden rounded-2xl w-full h-full min-h-[300px] md:min-h-[400px] lg:min-h-[500px] xl:min-h-[600px] 2xl:min-h-[700px] mx-auto"
            style={{
                background: "#0C1224",
                boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.5)',
                maxWidth: '95vw',
                aspectRatio: '16/9',
                margin: '0 auto'
            }}
        >
            <ShineBorder
                borderWidth={2}
                duration={8}
                shineColor={["#7E102C", "transparent"]}
                className="absolute inset-0 rounded-2xl z-10"
            />

            <div className="relative w-full h-full">
                <Image
                    src={member.pfpImage.replace(".heic", ".jpg")}
                    alt={member.name}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 95vw, (max-width: 1024px) 90vw, 80vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{
                        objectPosition: 'center 30%',
                    }}
                    priority={false}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 md:p-6 lg:p-8">
                    <h3 className="text-white font-medium text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl truncate">
                        {member.name}
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default LastYear;