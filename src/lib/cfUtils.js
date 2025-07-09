export const codeforcesRankColors = {
    "unrated": "#000000", // black
    "newbie": "#808080", // gray
    "pupil": "#008000", // green
    "specialist": "#03A89E", // cyan / teal
    "expert": "#0000FF", // blue
    "candidate master": "#AA00AA", // violet
    "master": "#FF8C00", // orange
    "international master": "#FF8C00", // same as master
    "grandmaster": "#FF0000", // red
    "international grandmaster": "#FF0000", // red
    "legendary grandmaster": "#AA0000" // maroon
  };
  
  export function getRankColor(rank = "unrated") {
    return codeforcesRankColors[rank.toLowerCase()] || "#000000";
  }
  