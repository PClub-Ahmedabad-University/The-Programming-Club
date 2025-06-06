// Color utility functions for team cards

// Get border color based on role
export const getBorderColor = (role) => {
    const colors = {
      "Secretary": "#4F46E5", // Indigo
      "Treasurer": "#10B981", // Emerald
      "Joint Secretary": "#8B5CF6", // Purple
      "Dev Lead": "#06B6D4", // Cyan
      "CP Lead": "#F59E0B", // Amber
      "Graphic Lead": "#EF4444", // Red
      "Social Media Head": "#EC4899", // Pink
      "Content Lead": "#14B8A6", // Teal
      "Communication Lead": "#6366F1", // Indigo
      "Web Team Member": "#3B82F6", // Blue
      "App Team Member": "#8B5CF6", // Purple
      "AI Team Member": "#10B981", // Emerald
      "CP Team Member": "#FBBF24", // Yellow
      "Graphic Team Member": "#F87171", // Light Red
      "Social Media Team Member": "#F472B6", // Light Pink
      "Content Team Member": "#2DD4BF", // Light Teal
      "Communication Team Member": "#818CF8", // Light Indigo
      "Dev Team Member": "#22D3EE", // Light Cyan
    };
    return colors[role] || "#3B82F6"; // default blue
  };
  
  // Get gradient based on role
  export const getGradient = (role) => {
    const gradients = {
      "Secretary": "linear-gradient(145deg,#4F46E5,#000)",
      "Treasurer": "linear-gradient(210deg,#10B981,#000)",
      "Joint Secretary": "linear-gradient(225deg,#8B5CF6,#000)",
      "Dev Lead": "linear-gradient(135deg,#06B6D4,#000)",
      "CP Lead": "linear-gradient(165deg,#F59E0B,#000)",
      "Graphic Lead": "linear-gradient(195deg,#EF4444,#000)",
      "Social Media Head": "linear-gradient(155deg,#EC4899,#000)",
      "Content Lead": "linear-gradient(175deg,#14B8A6,#000)",
      "Communication Lead": "linear-gradient(185deg,#6366F1,#000)",
      "Web Team Member": "linear-gradient(145deg,#3B82F6,#000)",
      "App Team Member": "linear-gradient(225deg,#8B5CF6,#000)",
      "AI Team Member": "linear-gradient(210deg,#10B981,#000)",
      "CP Team Member": "linear-gradient(165deg,#FBBF24,#000)",
      "Graphic Team Member": "linear-gradient(195deg,#F87171,#000)",
      "Social Media Team Member": "linear-gradient(155deg,#F472B6,#000)",
      "Content Team Member": "linear-gradient(175deg,#2DD4BF,#000)",
      "Communication Team Member": "linear-gradient(185deg,#818CF8,#000)",
      "Dev Team Member": "linear-gradient(135deg,#22D3EE,#000)",
    };
    return gradients[role] || "linear-gradient(145deg,#3B82F6,#000)";
  };
  