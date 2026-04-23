// import React from "react";
// import {
//   TiStarFullOutline,
//   TiStarHalfOutline,
//   TiStarOutline,
// } from "react-icons/ti";

// function RatingStars({ Review_Count = 0, Star_Size = 20 }) {
//   // Ensure rating stays between 0 and 5
//   const rating = Math.min(5, Math.max(0, Review_Count));

//   const fullStars = Math.floor(rating);
//   const hasHalfStar = rating % 1 !== 0 ? 1 : 0;
//   const emptyStars = 5 - (fullStars + hasHalfStar);

//   return (
//     <div className="flex items-center gap-1">
//       {/* Full Stars */}
//       {[...Array(fullStars)].map((_, i) => (
//         <TiStarFullOutline key={`full-${i}`} size={Star_Size} />
//       ))}

//       {/* Half Star */}
//       {[...Array(hasHalfStar)].map((_, i) => (
//         <TiStarHalfOutline key={`half-${i}`} size={Star_Size} />
//       ))}

//       {/* Empty Stars */}
//       {[...Array(emptyStars)].map((_, i) => (
//         <TiStarOutline key={`empty-${i}`} size={Star_Size} />
//       ))}
//     </div>
//   );
// }

// export default RatingStars;


import React, { useEffect, useState } from "react"
import {
  TiStarFullOutline,
  TiStarHalfOutline,
  TiStarOutline,
} from "react-icons/ti"

function RatingStars({ Review_Count, Star_Size }) {
  const [starCount, SetStarCount] = useState({
    full: 0,
    half: 0,
    empty: 0,
  })

  useEffect(() => {
    const wholeStars = Math.floor(Review_Count) || 0
    SetStarCount({
      full: wholeStars,
      half: Number.isInteger(Review_Count) ? 0 : 1,
      empty: Number.isInteger(Review_Count) ? 5 - wholeStars : 4 - wholeStars,
    })
  }, [Review_Count])
  return (
    <div className="flex gap-1 text-yellow-100">
      {[...new Array(starCount.full)].map((_, i) => {
        return <TiStarFullOutline key={i} size={Star_Size || 20} />
      })}
      {[...new Array(starCount.half)].map((_, i) => {
        return <TiStarHalfOutline key={i} size={Star_Size || 20} />
      })}
      {[...new Array(starCount.empty)].map((_, i) => {
        return <TiStarOutline key={i} size={Star_Size || 20} />
      })}
    </div>
  )
}

export default RatingStars