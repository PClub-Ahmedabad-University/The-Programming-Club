"use client";
import React, { useRef } from "react";
import ComingSoon from "../Components/ComingSoon";

const WMCPage = () => {
    // const iframeRef = useRef(null);

    return (
        <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
            <ComingSoon />
            {/* <iframe
                ref={iframeRef}
                src="/WMC/index.html"
                title="WMC Source Page"
                style={{ width: "100%", height: "100%", border: "none" }}
            /> */}
        </div>
    );
};

export default WMCPage;
