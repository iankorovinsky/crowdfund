"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { motion } from "framer-motion";
import { FiPlus, FiUsers, FiZap, FiTool } from "react-icons/fi";
import { BoxesCore } from "@/components/Boxes";
import { JoinRoomDialog } from "@/components/JoinRoom";

const Home = () => {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const router = useRouter();

  const createNewRoom = () => {
    const roomId = nanoid(10);
    router.push(`/room/${roomId}`);
  };

  const features = [
    {
      icon: <FiZap className="w-6 h-6" />,
      text: "Lightning-fast AI processing",
    },
    { icon: <FiUsers className="w-6 h-6" />, text: "Collaborative workspaces" },
    { icon: <FiTool className="w-6 h-6" />, text: "Custom AI agentupload" },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-900 flex flex-col items-center justify-center p-4 overflow-hidden">
      <BoxesCore />
      <div className="text-center space-y-8 max-w-4xl mx-auto relative z-10">
        <motion.h1
          className="text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          CrowdFunds
        </motion.h1>

        <motion.p
          className="text-gray-300 text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Connect Agentic AI models to create a revolutionary crypto trading
          workflow
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button
            onClick={createNewRoom}
            className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/20 flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create New Room</span>
          </Button>
          <Button
            onClick={() => setIsJoinDialogOpen(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-6 text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-gray-400/20 flex items-center space-x-2"
          >
            <FiUsers className="w-5 h-5" />
            <span>Join Existing Room</span>
          </Button>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-700 bg-opacity-40 p-6 rounded-lg backdrop-blur-sm flex flex-col items-start justify-center border border-gray-700 hover:border hover:border-blue-400 transition-all duration-300"
            >
              <div className="text-blue-400 mb-4">{feature.icon}</div>
              <p className="text-gray-300">{feature.text}</p>
            </div>
          ))}
        </motion.div>

        <motion.p
          className="text-gray-400 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          Start building your AI agent workflow by creating a new room or
          joining an existing one
        </motion.p>
      </div>
      <JoinRoomDialog
        isOpen={isJoinDialogOpen}
        onClose={() => setIsJoinDialogOpen(false)}
      />
    </div>
  );
};

export default Home;
