import React from "react";
import { FaUserGraduate, FaBookOpen } from "react-icons/fa";

const CourseCard = ({ cardData, currentCard, setCurrentCard }) => {
  const isActive = currentCard === cardData.heading;

  return (
    <div
      onClick={() => setCurrentCard(cardData.heading)}
      className={`relative w-[344px] h-[300px] cursor-pointer rounded-md border transition-all duration-300
        ${
          isActive
            ? "bg-white text-richblack-800 border-yellow-50 shadow-[6px_6px_0px_0px_#FFD60A]"
            : "bg-richblack-800 text-richblack-200 border-richblack-700 hover:bg-richblack-700"
        }
      `}
    >
      <div className="flex flex-col justify-between h-full p-6">
        {/* Top */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">
            {cardData.heading}
          </h3>
          <p className="text-sm opacity-80">
            {cardData.description}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-richblack-600 mt-20" />

        {/* Bottom */}
        <div className="flex justify-between items-center text-sm opacity-80">
          <div className="flex items-center gap-2">
            <FaUserGraduate />
            <span>{cardData.level}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaBookOpen />
            <span>{cardData.lessionNumber} Lessons</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
