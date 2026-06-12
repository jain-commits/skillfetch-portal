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