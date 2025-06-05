import React from 'react';
import * as motion from "motion/react-client"

const CodeTerminal = () => {
  return (
    <div className="terminal-container h-70 w-2/6 rounded-md bg-black px-4 py-4 shadow-2xl">
        <div className="top-circles flex gap-3">
            <div className="red h-4 w-4 rounded-full bg-red-500"></div>
            <div className="red h-4 w-4 rounded-full bg-yellow-500"></div>
            <div className="red h-4 w-4 rounded-full bg-blue-500"></div>
        </div>
        <div className="code-section text-white space-y-1 mt-3">
            <code>
                <motion.div
                    className='mb-2'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0, duration: 0.5 }}
                >
                    <span className="text-green-400">$</span> 
                    <span className="text-green-300">sudo join pclub</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 0.5 }}
                >
                    <span className="text-gray-400">&gt; brain activity detected</span> 
                    <span className="text-green-500">✔</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 0.5 }}
                >
                    <span className="text-gray-400">&gt; curiosity level:</span> 
                    <span className="text-yellow-400"> HIGH</span> 
                    <span className="text-green-500">✔</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3, duration: 0.5 }}
                >
                    <span className="text-gray-400">&gt; caffeine intake:</span> 
                    <span className="text-blue-300"> sufficient</span> ☕ 
                    <span className="text-green-500">✔</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.5, duration: 0.5 }}
                >
                    <span className="text-gray-400">&gt; verifying user...</span>
                </motion.div>

                <motion.div
                    className='mt-3 mb-2'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 5, duration: 0.5 }}
                >
                    <span className="text-green-400">&gt; Welcome, dev!</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 7, duration: 0.5 }}
                >
                    <span className="text-white">You're now inside</span> 
                    <span className="text-purple-300"> PClub 🧠💡</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 7.5, duration: 0.5 }}
                >
                    <span className="text-white">Let’s make something</span> 
                    <span className="text-pink-400"> awesome</span><span className="text-white">.</span>
                </motion.div>
            </code>
        </div>
    </div>
  )
}

export default CodeTerminal