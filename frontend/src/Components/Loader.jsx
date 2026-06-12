//VERSON 1
// import "./Loader.css";

// export default function Loader() {
//   return (
//     <div id="loader-container">
//       <span className="loader"></span>
//     </div>
//   );
// }


// VERSION 2
import "./Loader.css";

export default function Loader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 0",
        width: "100%",
      }}
    >
      <span className="loader"></span>
    </div>
  );
}

// VERSION 3
// import "./Loader.css";

// export default function Loader() {
//   return (
//     <div className="loader-wrapper">
//       <span className="loader"></span>
//     </div>
//   );
// }