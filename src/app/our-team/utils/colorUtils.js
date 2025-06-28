// Color utility functions for team cards

// Get border color based on role
export const getBorderColor = (role) => {
    const colors = {
      "Secretary": "#4F46E5", // Indigo
      "Treasurer": "#10B981", // Emerald
      "Joint Secretary": "#8B5CF6", // Purple
      "Dev Lead": "#06B6D4", // Cyan
      "CP Lead": "#00C957", // Neon Dark Green
      "Graphic Lead": "#EF4444", // Red
      "Social Media Head": "#EC4899", // Pink
      "Content & Communications Lead": "#FF9900", // Neon Orange
      "CP Team member": "#39FF14", // Neon Green
      "Graphic Team member": "#F87171", // Light Red
      "Social Media Team member": "#F472B6", // Light Pink
      "Content & Communications Team member": "#FFB347", //  Light Glow stick orange 
      "Dev Team member": "#22D3EE", // Light Cyan
      "Volunteer": "#F59E0B", // Amber
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
      "CP Lead": "linear-gradient(165deg,#22C55E,#000)",
      "Graphic Lead": "linear-gradient(195deg,#EF4444,#000)",
      "Social Media Head": "linear-gradient(155deg,#EC4899,#000)",
      "Content & Communications Lead": "linear-gradient(185deg,#6366F1,#000)",
      "CP Team member": "linear-gradient(165deg,#FBBF24,#000)",
      "Graphic Team member": "linear-gradient(195deg,#F87171,#000)",
      "Social Media Team member": "linear-gradient(155deg,#F472B6,#000)",
      "Content & Communications Team member": "linear-gradient(185deg,#818CF8,#000)",
      "Dev Team member": "linear-gradient(135deg,#22D3EE,#000)",
      "Volunteer": "linear-gradient(165deg,#F59E0B,#000)",
    };
    return gradients[role] || "linear-gradient(145deg,#3B82F6,#000)";
  };
  