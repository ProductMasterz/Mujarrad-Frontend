import svgPaths from "./svg-jx9axm0ra9";

function VuesaxLinearCodeCircle() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/code-circle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="code-circle">
          <path d={svgPaths.pace200} id="Vector" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
          <g id="Vector_2" opacity="0"></g>
        </g>
      </svg>
    </div>
  );
}

export default function VuesaxLinearNode() {
  return (
    <div className="relative size-full" data-name="vuesax/linear/Node">
      <VuesaxLinearCodeCircle />
    </div>
  );
}
